import {PayloadTooLarge} from '../errors';
import {listToUint8} from '@jsonjoy.com/buffers/lib/concat';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {ConnectionContext, RpcMessageCodec, WsConnection} from '../types';
import type {HttpResponse} from './types-uws';

export class UwsHttpConnectionContext<Meta = Record<string, unknown>> implements ConnectionContext<Meta> {
  constructor(
    public readonly res: HttpResponse,
    public path: string,
    public query: string,
    public readonly ip: string,
    public token: string,
    public readonly params: string[] | null,
    public readonly meta: Meta,
    public reqCodec: JsonValueCodec,
    public resCodec: JsonValueCodec,
    public msgCodec: RpcMessageCodec,
  ) {}

  public body(maxPayload: number): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      const res = this.res;
      const chunks: Buffer[] = [];
      let size = 0;
      res.onData((chunk, isLast) => {
        const buf = Buffer.from(new Uint8Array(chunk));
        size += buf.length;
        if (size > maxPayload) {
          reject(new PayloadTooLarge());
          return;
        }
        chunks.push(buf);
        if (isLast) {
          resolve(listToUint8(chunks));
        }
      });
    });
  }
}

export class UwsWsConnectionContext<Meta = Record<string, unknown>> implements ConnectionContext<Meta> {
  constructor(
    public readonly connection: WsConnection,
    public path: string,
    public query: string,
    public readonly ip: string,
    public token: string,
    public readonly params: string[] | null,
    public readonly meta: Meta,
    public reqCodec: JsonValueCodec,
    public resCodec: JsonValueCodec,
    public msgCodec: RpcMessageCodec,
  ) {}
}
