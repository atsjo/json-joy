import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {RpcMessageFormat} from './constants';

/**
 * Encodes/decodes messages to/from serialized physical batches (chunks).
 * `Chunk` is usually `string` or `Uint8Array`, depending on the transport.
 */
export interface BatchCodec<Chunk, Message> {
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

export type StrBatchCodec<Message> = BatchCodec<string, Message>;
export type BinBatchCodec<Message> = BatchCodec<Uint8Array, Message>;

/**
 * Encodes/decodes messages one-by-one or in batches. Can `.write()` directly
 * to a stream `Writer` buffer resolved by {@link JsonValueCodec}.
 */
export interface MessageCodec<Message> {
  id: string;

  /**
   * Message envelope format, i.e. format of the payload wrapper. The format
   * of the message payload itself is determined by the JsonValueCodec.
   *
   */
  format: RpcMessageFormat;

  write(valueCodec: JsonValueCodec, message: Message): void;
  writeBatch(valueCodec: JsonValueCodec, messages: Message[]): void;
  encode(valueCodec: JsonValueCodec, batch: Message[]): Uint8Array;
  read(valueCodec: JsonValueCodec): Message[];
  decode(valueCodec: JsonValueCodec, uint8: Uint8Array): Message[];
}
