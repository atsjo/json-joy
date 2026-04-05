import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {ConnectionContext, RpcMessageCodec, WsConnection} from '../types';

export class WsConnectionContext<Meta = Record<string, unknown>> implements ConnectionContext<Meta> {
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
