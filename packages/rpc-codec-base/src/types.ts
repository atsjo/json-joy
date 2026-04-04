import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {RpcMessage} from '@jsonjoy.com/rpc-messages';
import type {RpcMessageFormat} from './constants';

export interface MsgCodec<Chunk, Message> {
  id: string;

  /**
   * Message envelope format, i.e. format of the payload wrapper. The format
   * of the message payload itself is determined by the JsonValueCodec.
   *
   */
  format: RpcMessageFormat;

  toChunk(messages: Message[]): Chunk;
  fromChunk(chunk: Chunk): Message[];
}

export type TextMsgCodec<Message> = MsgCodec<string, Message>;
export type BinaryMsgCodec<Message> = MsgCodec<Uint8Array, Message>;

export interface MsgStreamCodec {
  id: string;

  /**
   * Message envelope format, i.e. format of the payload wrapper. The format
   * of the message payload itself is determined by the JsonValueCodec.
   *
   */
  format: RpcMessageFormat;

  write(codec: JsonValueCodec, message: RpcMessage): void;
  writeBatch(codec: JsonValueCodec, messages: RpcMessage[]): void;
  encode(jsonCodec: JsonValueCodec, batch: RpcMessage[]): Uint8Array;
  read(codec: JsonValueCodec): RpcMessage[];
  readChunk(codec: JsonValueCodec, uint8: Uint8Array): RpcMessage[];
}
