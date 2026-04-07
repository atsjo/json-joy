import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {copy} from '@jsonjoy.com/buffers/lib/copy';
import {type Match, Router} from '@jsonjoy.com/jit-router';
import {enableCors} from './util';
import {BatchDispatcher} from '@jsonjoy.com/rpc-calls/lib/dispatcher/BatchDispatcher';
import {RpcError} from '@jsonjoy.com/rpc-error';
import {RpcCodec} from '@jsonjoy.com/rpc-codec';
import {RpcCodecs, RpcMessageCodecs} from '@jsonjoy.com/rpc-codec';
import {RxLogicalChannelBase} from '@jsonjoy.com/rpc-calls/lib/channel/RxLogicalChannelBase';
import {RxLogicalChannelBaseDispatcher} from '@jsonjoy.com/rpc-calls/lib/dispatcher/RxLogicalChannelBaseDispatcher';
import {NullObject} from '@jsonjoy.com/util/lib/NullObject';
import {UwsHttpConnectionContext, UwsWsConnectionContext} from './context';
import {UwsConnection} from './UwsConnection';
import {setCodecs} from '../http1/util';
import {findTokenInText} from '../util';
import {printTree} from 'tree-dump/lib/printTree';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {Printable} from 'tree-dump/lib/types';
import type * as types from './types';
import type {RouteHandler, RpcWebSocket} from './types';
import type {AnyCallee} from '@jsonjoy.com/rpc-calls';
import type {RpcLogger} from '@jsonjoy.com/rpc-error';
import type {RpcMessageCodec} from '../types';

const HDR_BAD_REQUEST = Buffer.from('400 Bad Request', 'utf8');
const HDR_NOT_FOUND = Buffer.from('404 Not Found', 'utf8');

const noop = () => {};

export interface RpcAppOptions {
  uws: types.TemplatedApp;
  callee: AnyCallee;

  /**
   * Maximum request body size in bytes. Default is 1MB.
   */
  maxRequestBodySize?: number;

  /**
   * Serializers and de-serializers for request and response bodies.
   */
  codecs?: Codecs;

  /**
   * HTTP port to listen on. If not specified, the PORT environment variable
   * will be used, or 9999 if not set.
   */
  port?: number;

  /**
   * Host to listen to. If not specified, the HOST environment variable will be
   * used, or '0.0.0.0' if not set.
   */
  host?: string;

  /**
   * This method allows to augment connection context with additional data.
   *
   * @param ctx Connection context.
   */
  augmentContext?: (ctx: UwsHttpConnectionContext | UwsWsConnectionContext) => void;

  /**
   * Logger to use for logging. If not specified, console will be used.
   */
  logger?: RpcLogger;
}

interface RouteMatch {
  handler: RouteHandler;
  msgCodec?: RpcMessageCodec;
}

export class RpcApp implements Printable {
  public readonly codecs: RpcCodecs;
  protected readonly app: types.TemplatedApp;
  protected readonly maxRequestBodySize: number;
  protected readonly router = new Router<RouteMatch>();
  protected readonly dispatcher: BatchDispatcher;

  constructor(protected readonly options: RpcAppOptions) {
    this.app = options.uws;
    this.maxRequestBodySize = options.maxRequestBodySize ?? 1024 * 1024;
    this.codecs = new RpcCodecs(options.codecs ?? new Codecs(new Writer()), new RpcMessageCodecs());
    this.dispatcher = new BatchDispatcher({callee: options.callee as any});
  }

  public enableCors() {
    enableCors(this.options.uws);
  }

  public routeRaw(method: types.HttpMethodPermissive, path: string, handler: RouteHandler, msgCodec?: RpcMessageCodec): void {
    method = method.toLowerCase() as types.HttpMethodPermissive;
    this.router.add(method + path, {handler, msgCodec});
  }

  public route(method: types.HttpMethodPermissive, path: string, handler: types.JsonRouteHandler): void {
    this.routeRaw(method, path, async (ctx: UwsHttpConnectionContext) => {
      const result = await handler(ctx);
      const res = ctx.res;
      if (res.aborted) return;
      const codec = ctx.resCodec;
      const encoder = codec.encoder;
      const writer = encoder.writer;
      writer.reset();
      encoder.writeAny(result);
      if (res.aborted) return;
      res.cork(() => {
        res.end(writer.flush());
      });
    });
  }

  public enableHttpPing(path = '/ping'): this {
    this.route('GET', path, async () => {
      return 'pong';
    });
    return this;
  }

  public enableHttpRpc(path = '/rx', msgCodec?: RpcMessageCodec): this {
    const defaultMsgCodec = msgCodec ?? this.codecs.msg.compact;
    this.routeRaw('POST', path, async (ctx: UwsHttpConnectionContext) => {
      try {
        const res = ctx.res;
        const bodyUint8 = await ctx.body(this.maxRequestBodySize);
        if (res.aborted) return;
        const messageCodec = ctx.msgCodec;
        const incomingMessages = messageCodec.decode(ctx.reqCodec, bodyUint8);
        try {
          const outgoingMessages = await this.dispatcher.onBatch(incomingMessages as any, ctx);
          if (res.aborted) return;
          const resCodec = ctx.resCodec;
          messageCodec.writeBatch(resCodec, outgoingMessages as any);
          const buf = resCodec.encoder.writer.flush();
          if (res.aborted) return;
          res.cork(() => {
            res.end(buf);
          });
        } catch (error) {
          const logger = this.options.logger ?? console;
          logger.error('HTTP_RPC_PROCESSING', error, {messages: incomingMessages});
          throw RpcError.from(error);
        }
      } catch (error) {
        if (typeof error === 'object' && error)
          if ((error as any).message === 'Invalid JSON') throw RpcError.badRequest();
        throw RpcError.from(error);
      }
    }, defaultMsgCodec);
    return this;
  }

  public enableJsonRpc2HttpRpc(path = '/rpc'): this {
    return this.enableHttpRpc(path, this.codecs.msg.jsonRpc2);
  }

  public enableWsRpc(path = '/rx'): this {
    const augmentContext = this.options.augmentContext ?? noop;
    const options = this.options;
    const logger = options.logger ?? console;
    const callee = options.callee;
    const codecs = this.codecs;
    this.app.ws(path, {
      idleTimeout: 0,
      maxPayloadLength: 4 * 1024 * 1024,
      maxBackpressure: 4 * 1024 * 1024,
      upgrade: (res, req, context) => {
        const secWebSocketKey = req.getHeader('sec-websocket-key');
        const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
        const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');
        const url = req.getUrl();
        const query = req.getQuery();
        const ip =
          req.getHeader('x-forwarded-for') ||
          req.getHeader('x-real-ip') ||
          Buffer.from(res.getRemoteAddressAsText()).toString();
        let token = '';
        const authorization = req.getHeader('authorization');
        if (authorization) token = findTokenInText(authorization);
        if (!token) token = findTokenInText(url);
        if (!token && secWebSocketProtocol) token = findTokenInText(secWebSocketProtocol);
        const uwsConnection = new UwsConnection();
        const ctx = new UwsWsConnectionContext(
          uwsConnection,
          url,
          query,
          ip,
          token,
          null,
          new NullObject(),
          codecs.val.json,
          codecs.val.json,
          codecs.msg.compact,
        );
        if (secWebSocketProtocol) setCodecs(ctx, secWebSocketProtocol, codecs);
        augmentContext(ctx);
        /* This immediately calls open handler, you must not use res after this call */
        res.upgrade({uwsConnection, ctx}, secWebSocketKey, secWebSocketProtocol, secWebSocketExtensions, context);
      },
      open: (ws_: types.WebSocket) => {
        try {
          const ws = ws_ as RpcWebSocket;
          const uwsConnection = ws.uwsConnection;
          const ctx = ws.ctx;
          uwsConnection.ws = ws;
          const codec = new RpcCodec(ctx.msgCodec, ctx.reqCodec, ctx.resCodec);
          const logicalChannel = new RxLogicalChannelBase(uwsConnection, codec);
          new RxLogicalChannelBaseDispatcher(logicalChannel, callee as any, ctx);
        } catch (error) {
          logger.error('UWS_WS_OPEN', error);
        }
      },
      message: (ws_: types.WebSocket, buf: ArrayBuffer) => {
        try {
          const ws = ws_ as RpcWebSocket;
          const uwsConnection = ws.uwsConnection;
          const uint8 = copy(new Uint8Array(buf));
          if (uwsConnection.onmessage) uwsConnection.onmessage(uint8, false);
        } catch (error) {
          logger.error('UWS_WS_MESSAGE', error);
        }
      },
      close: (ws_: types.WebSocket, code: number) => {
        const ws = ws_ as RpcWebSocket;
        const uwsConnection = ws.uwsConnection;
        uwsConnection.closed = true;
        uwsConnection.ws = null;
        if (uwsConnection.onclose) uwsConnection.onclose(code, '', true);
      },
    });
    return this;
  }

  public startRouting(): void {
    const matcher = this.router.compile();
    const codecs = this.codecs;
    const options = this.options;
    const augmentContext = options.augmentContext ?? noop;
    const logger = options.logger ?? console;
    this.app.any('/*', async (res: types.HttpResponse, req: types.HttpRequest) => {
      try {
        res.onAborted(() => {
          res.aborted = true;
        });
        const method = req.getMethod();
        const url = req.getUrl();
        const query = req.getQuery();
        try {
          const match = matcher(method + url) as undefined | Match<RouteMatch>;
          if (!match) {
            res.cork(() => {
              res.writeStatus(HDR_NOT_FOUND);
              res.end();
            });
            return;
          }
          const matchData = match.data;
          const handler = matchData.handler;
          const params = match.params;
          const ip =
            req.getHeader('x-forwarded-for') ||
            req.getHeader('x-real-ip') ||
            Buffer.from(res.getRemoteAddressAsText()).toString();
          let token = '';
          const authorization = req.getHeader('authorization');
          if (authorization) token = findTokenInText(authorization);
          if (!token) token = findTokenInText(url);
          const contentType = req.getHeader('content-type');
          const ctx = new UwsHttpConnectionContext(
            res,
            url,
            query,
            ip,
            token,
            params,
            new NullObject(),
            codecs.val.json,
            codecs.val.json,
            matchData.msgCodec ?? codecs.msg.jsonRpc2,
          );
          if (contentType) setCodecs(ctx, contentType, codecs);
          augmentContext(ctx);
          await handler(ctx);
        } catch (_error: unknown) {
          let err: unknown = _error;
          if (!(err instanceof RpcError)) err = RpcError.from(err);
          const error = <RpcError>err;
          logger.error('UWS_ROUTER_ERROR', error);
          res.cork(() => {
            res.writeStatus(HDR_BAD_REQUEST);
            res.end(JSON.stringify(error.toJson()));
          });
        }
      } catch {}
    });
  }

  public startWithDefaults(): void {
    this.enableCors();
    this.enableHttpPing();
    this.enableHttpRpc();
    this.enableJsonRpc2HttpRpc();
    this.enableWsRpc();
    this.startRouting();
    const options = this.options;
    const port = options.port ?? +(process.env.PORT || 9999);
    const host = options.host ?? process.env.HOST ?? '0.0.0.0';
    const logger = options.logger ?? console;
    this.options.uws.listen(host, port, (token) => {
      if (token) {
        logger.log({msg: 'SERVER_STARTED', url: `http://localhost:${port}`});
      } else {
        logger.error('SERVER_START', new Error(`Failed to listen on ${port} port.`));
      }
    });
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab = ''): string {
    return (
      `${this.constructor.name}` +
      printTree(tab, [
        (tab) => this.router.toString(tab),
        () => '',
        (tab) => (this.options.callee as unknown as Printable).toString(tab),
      ])
    );
  }
}
