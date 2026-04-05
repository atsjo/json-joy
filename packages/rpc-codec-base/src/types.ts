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
export interface StreamCodec<Message> {
  id: string;

  /**
   * Message envelope format, i.e. format of the payload wrapper. The format
   * of the message payload itself is determined by the JsonValueCodec.
   *
   */
  format: RpcMessageFormat;

  write(codec: JsonValueCodec, message: Message): void;
  writeBatch(codec: JsonValueCodec, messages: Message[]): void;
  encode(jsonCodec: JsonValueCodec, batch: Message[]): Uint8Array;
  read(codec: JsonValueCodec): Message[];
  readChunk(codec: JsonValueCodec, uint8: Uint8Array): Message[];
}
