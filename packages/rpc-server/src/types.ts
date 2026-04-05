import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {StreamCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';
import type {PhysicalChannelBase} from '@jsonjoy.com/channel';

export type RpcMessageCodec = StreamCodec<RxMessage>;

export interface ConnectionContext<Meta = Record<string, unknown>> {
  path: string;
  query: string;
  ip: string;
  token: string;
  params: string[] | null;
  meta: Meta;
  reqCodec: JsonValueCodec;
  resCodec: JsonValueCodec;
  msgCodec: RpcMessageCodec;
}

export interface WsConnection extends PhysicalChannelBase<Uint8Array> {
  closed: boolean;
  onmessage?: (data: Uint8Array, isUtf8: boolean) => void;
  onclose?: (code: number, reason: string, wasClean: boolean) => void;
  close(code?: number, reason?: string): void;
  send(data: Uint8Array): number;
  buffer(): number;
  sendPing(data: Uint8Array | null): void;
  sendPong(data: Uint8Array | null): void;
  sendBinMsg(data: Uint8Array): void;
  sendTxtMsg(txt: string): void;
}

export interface ServerLogger {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
}
