import type {Printable} from 'tree-dump/lib/types';
import {printTree} from 'tree-dump/lib/printTree';
import {type Http1CreateServerOpts, Http1Server, type Http1ServerOpts} from './Http1Server';
import {RpcError} from '@jsonjoy.com/rpc-error';
import {gzip} from '@jsonjoy.com/util/lib/compression/gzip';
import type {Callee} from '@jsonjoy.com/rpc-calls';
import {ResponseCompleteMessage, ResponseErrorMessage} from '@jsonjoy.com/rpc-messages';
import {unknown} from '@jsonjoy.com/json-type/lib/value/Value';
import type {ConnectionContext, ServerLogger} from '../types';
import type {Http1ConnectionContext} from './Http1ConnectionContext';

const DEFAULT_MAX_PAYLOAD = 4 * 1024 * 1024;

export interface RpcServerOpts {
  http1: Http1Server;
  caller: Callee<any, any>;
  logger?: ServerLogger;
}

export interface RpcServerStartOpts extends Omit<RpcServerOpts, 'http1'> {
  port?: number;
  server?: Omit<Http1ServerOpts, 'server'>;
  create?: Http1CreateServerOpts;
}

export class RpcServer implements Printable {
  public static readonly startWithDefaults = async (opts: RpcServerStartOpts): Promise<RpcServer> => {
    const port = opts.port || 8080;
    const logger = opts.logger ?? console;
    const server = await Http1Server.create(opts.create);
    const http1 = new Http1Server({...opts.server, server});
    const rpc = new RpcServer({
      caller: opts.caller,
      http1,
      logger,
    });
    rpc.enableDefaults();
    await http1.start();
    server.listen(port, () => {
      let host = server.address() || 'localhost';
      if (typeof host === 'object') host = (host as any).address;
      logger.log({msg: 'SERVER_STARTED', host, port});
    });
    return rpc;
  };

  public readonly http1: Http1Server;

  constructor(protected readonly opts: RpcServerOpts) {
    const http1 = (this.http1 = opts.http1);
    const onInternalError = http1.oninternalerror;
    http1.oninternalerror = (error, res, req) => {
      if (error instanceof RpcError) {
        res.statusCode = 400;
        const data = JSON.stringify(error.toJson());
        res.end(data);
        return;
      }
      onInternalError(error, res, req);
    };
  }

  public enableHttpPing(): void {
    const http1 = this.http1;
    http1.enableHttpPing();
    http1.enableKamalPing();
  }

  public enableCors(): void {
    this.http1.route({
      method: 'OPTIONS',
      path: '/{::\n}',
      handler: (ctx) => {
        const res = ctx.res;
        res.writeHead(200, 'OK', {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          // 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          // 'Access-Control-Allow-Headers': 'Content-Type',
          // 'Access-Control-Max-Age': '86400',
        });
        res.end();
      },
    });
  }

  private processHttpRpcRequest = async (ctx: Http1ConnectionContext) => {
    const res = ctx.res;
    const body = await ctx.body(DEFAULT_MAX_PAYLOAD);
    if (!res.socket) return;
    try {
      const messageCodec = ctx.msgCodec;
      const incomingMessages = messageCodec.readChunk(ctx.reqCodec, body);
      try {
        const caller = this.opts.caller;
        const promises: Promise<unknown>[] = [];
        for (const msg of incomingMessages) {
          if ('method' in msg && 'id' in msg) {
            promises.push(caller.call((msg as any).method, (msg as any).value?.data, ctx));
          } else if ('method' in msg) {
            caller.notify((msg as any).method, (msg as any).value?.data, ctx).catch(() => {});
          }
        }
        const results = await Promise.allSettled(promises);
        if (!res.socket) return;
        const resCodec = ctx.resCodec;
        const outgoing: unknown[] = [];
        let idx = 0;
        for (const msg of incomingMessages) {
          if ('method' in msg && 'id' in msg) {
            const result = results[idx++];
            if (result.status === 'fulfilled') {
              outgoing.push(new ResponseCompleteMessage((msg as any).id, unknown(result.value)));
            } else {
              outgoing.push(new ResponseErrorMessage((msg as any).id, unknown(result.reason)));
            }
          }
        }
        messageCodec.writeBatch(resCodec, outgoing as any);
        const buf = resCodec.encoder.writer.flush();
        if (!res.socket) return;
        res.end(buf);
      } catch (error) {
        const logger = this.opts.logger ?? console;
        logger.error('HTTP_RPC_PROCESSING', error, {messages: incomingMessages});
        throw RpcError.from(error);
      }
    } catch (error) {
      if (typeof error === 'object' && error)
        if ((error as any).message === 'Invalid JSON') throw RpcError.badRequest();
      throw RpcError.from(error);
    }
  };

  public enableHttpRpc(path = '/rx'): void {
    const http1 = this.http1;
    http1.route({
      method: 'POST',
      path,
      handler: this.processHttpRpcRequest,
      msgCodec: http1.codecs.msg.compact,
    });
  }

  public enableJsonRcp2HttpRpc(path = '/rpc'): void {
    const http1 = this.http1;
    http1.route({
      method: 'POST',
      path,
      handler: this.processHttpRpcRequest,
      msgCodec: http1.codecs.msg.jsonRpc2,
    });
  }

  public enableWsRpc(path = '/rx'): void {
    const opts = this.opts;
    const caller = opts.caller;
    this.http1.ws({
      path,
      maxIncomingMessage: 2 * 1024 * 1024,
      maxOutgoingBackpressure: 2 * 1024 * 1024,
      handler: (ctx, req) => {
        const connection = ctx.connection;
        connection.onmessage = async (data: Uint8Array) => {
          try {
            const messages = ctx.msgCodec.readChunk(ctx.reqCodec, data);
            for (const msg of messages) {
              if ('method' in msg && 'id' in msg) {
                try {
                  const result = await caller.call((msg as any).method, (msg as any).value?.data, ctx);
                  const resCodec = ctx.resCodec;
                  ctx.msgCodec.write(resCodec, new ResponseCompleteMessage((msg as any).id, unknown(result)));
                  const buf = resCodec.encoder.writer.flush();
                  connection.sendBinMsg(buf);
                } catch (error) {
                  const resCodec = ctx.resCodec;
                  ctx.msgCodec.write(resCodec, new ResponseErrorMessage((msg as any).id, unknown(error)));
                  const buf = resCodec.encoder.writer.flush();
                  connection.sendBinMsg(buf);
                }
              } else if ('method' in msg) {
                caller.notify((msg as any).method, (msg as any).value?.data, ctx).catch(() => {});
              }
            }
          } catch {}
        };
      },
    });
  }

  /**
   * Exposes JSON Type schema under the GET /schema endpoint.
   */
  public enableSchema(path: string = '/schema', method: string = 'GET'): void {
    let responseBody: Uint8Array = Buffer.from('{}');
    let responseBodyCompressed: Uint8Array = new Uint8Array(0);
    gzip(responseBody).then((compressed) => (responseBodyCompressed = compressed));
    this.http1.route({
      method,
      path,
      handler: (ctx) => {
        const res = ctx.res;
        res.writeHead(200, 'OK', {
          'Content-Type': 'application/json',
          'Content-Encoding': 'gzip',
          'Cache-Control': 'public, max-age=3600, immutable',
          'Content-Length': responseBodyCompressed.length,
        });
        res.end(responseBodyCompressed);
      },
    });
  }

  public enableDefaults(): void {
    this.enableCors();
    this.enableHttpPing();
    this.enableHttpRpc();
    this.enableJsonRcp2HttpRpc();
    this.enableWsRpc();
    this.enableSchema();
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab = ''): string {
    return (
      `${this.constructor.name}` +
      printTree(tab, [
        (tab) => this.http1.toString(tab),
        () => '',
        (tab) => (this.opts.caller as unknown as Printable).toString(tab),
      ])
    );
  }
}
