import {RpcMessageFormat} from '@jsonjoy.com/rpc-codec-base/lib/constants';
import {CompactMessageType} from '@jsonjoy.com/rpc-messages/lib/constants';
import {BinaryMessageType} from './constants';
import {BinaryMessageWriter} from './BinaryMessageWriter';
import type {CompactMessage} from '@jsonjoy.com/rpc-messages';
import type {getEncoder} from '@jsonjoy.com/json-type/lib/codegen/binary/shared';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {BinBatchCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';
import type {IReader} from '@jsonjoy.com/buffers/lib/types';

type Message = CompactMessage;

const readPayload = (decoder: JsonValueCodec['decoder'], uint8: Uint8Array, start: number, size: number): unknown => {
  if (!size) return undefined;
  const reader = decoder.reader;
  const source = reader.uint8;
  const x = reader.x;
  const value = decoder.read(uint8.subarray(start, start + size));
  reader.reset(source);
  reader.x = x;
  return value;
};

const readPayloadId = (
  reader: IReader,
  word: number,
): {
  payloadStart: number;
  payloadSize: number;
  id: number;
} => {
  const payloadStart = reader.x;
  if (word & 0b1_0000_00000000_00000000_00000000) {
    if (word & 0b10000000_00000000) {
      const payloadSize = ((0b1111_11111111 & (word >>> 16)) << 15) | (word & 0b1111111_11111111);
      reader.skip(payloadSize);
      return {
        payloadStart,
        payloadSize,
        id: reader.u16(),
      };
    }
    const payloadSize = ((0b1111_11111111 & (word >>> 16)) << 7) | ((word >>> 8) & 0x7f);
    reader.skip(payloadSize);
    return {
      payloadStart,
      payloadSize,
      id: ((word & 0xff) << 8) | reader.u8(),
    };
  }
  const payloadSize = (word >>> 16) & 0b1111_11111111;
  reader.skip(payloadSize);
  return {
    payloadStart,
    payloadSize,
    id: word & 0xffff,
  };
};

/**
 * Lite binary Reactive JSON RPC codec intended for browser/client use.
 * Encodes/decodes in "binary" message format directly messages in "compact"
 * message format.
 */
export class CompactBinaryMsgCodec implements BinBatchCodec<Message> {
  public readonly id = 'rx.binary';
  public readonly format = RpcMessageFormat.Binary;
  private readonly msgWriter: BinaryMessageWriter;

  constructor(
    public readonly codec: JsonValueCodec,
    getTypeEncoder?: typeof getEncoder,
  ) {
    this.msgWriter = new BinaryMessageWriter(getTypeEncoder);
  }

  public toChunk(batch: Message[]): Uint8Array {
    const codec = this.codec;
    const writer = codec.encoder.writer;
    writer.reset();
    const length = batch.length;
    const msgWriter = this.msgWriter;
    for (let i = 0; i < length; i++) {
      const message = batch[i];
      switch (message[0]) {
        case CompactMessageType.Notification:
          msgWriter.writeType2(codec, message[1] as string, message.length > 2 ? message[2] : undefined);
          break;
        case CompactMessageType.RequestData:
          msgWriter.writeType4(
            codec,
            BinaryMessageType.RequestData << 13,
            message[1] as number,
            message[2] as string,
            message.length > 3 ? message[3] : undefined,
          );
          break;
        case CompactMessageType.RequestComplete:
          msgWriter.writeType4(
            codec,
            BinaryMessageType.RequestComplete << 13,
            message[1] as number,
            message[2] as string,
            message.length > 3 ? message[3] : undefined,
          );
          break;
        case CompactMessageType.RequestError:
          msgWriter.writeType4(
            codec,
            BinaryMessageType.RequestError << 13,
            message[1] as number,
            message[2] as string,
            message[3],
          );
          break;
        case CompactMessageType.RequestUnsubscribe:
          writer.u32(0b11100000_00000000_00000000_00000000 | (message[1] as number));
          break;
        case CompactMessageType.ResponseData:
          msgWriter.writeType3(codec, BinaryMessageType.ResponseData << 13, message[1] as number, message[2]);
          break;
        case CompactMessageType.ResponseComplete:
          msgWriter.writeType3(
            codec,
            BinaryMessageType.ResponseComplete << 13,
            message[1] as number,
            message.length > 2 ? message[2] : undefined,
          );
          break;
        case CompactMessageType.ResponseError:
          msgWriter.writeType3(codec, BinaryMessageType.ResponseError << 13, message[1] as number, message[2]);
          break;
        case CompactMessageType.ResponseUnsubscribe:
          writer.u32(0b11100000_00000001_00000000_00000000 | (message[1] as number));
          break;
        default:
          throw new Error('UNKNOWN_MSG');
      }
    }
    return writer.flush();
  }

  public fromChunk(uint8: Uint8Array): Message[] {
    const codec = this.codec;
    const decoder = codec.decoder;
    const reader = decoder.reader;
    reader.reset(uint8);
    const messages: Message[] = [];
    while (reader.x < reader.uint8.length) {
      const word = reader.u32();
      const type = word >>> 29;
      switch (type) {
        case BinaryMessageType.Notification: {
          const nameLength = word & 0xff;
          const payloadSize = word >>> 8;
          const name = reader.ascii(nameLength);
          const payloadStart = reader.x;
          reader.skip(payloadSize);
          if (payloadSize) {
            const value = readPayload(decoder, reader.uint8, payloadStart, payloadSize);
            messages.push([CompactMessageType.Notification, name, value]);
          } else messages.push([CompactMessageType.Notification, name]);
          break;
        }
        case BinaryMessageType.RequestData:
        case BinaryMessageType.RequestComplete:
        case BinaryMessageType.RequestError: {
          const nameLength = reader.u8();
          const name = reader.ascii(nameLength);
          const {payloadStart, payloadSize, id} = readPayloadId(reader, word);
          const hasPayload = payloadSize > 0;
          const value = hasPayload ? readPayload(decoder, reader.uint8, payloadStart, payloadSize) : undefined;
          switch (type) {
            case BinaryMessageType.RequestData:
              if (hasPayload) messages.push([CompactMessageType.RequestData, id, name, value]);
              else messages.push([CompactMessageType.RequestData, id, name]);
              break;
            case BinaryMessageType.RequestComplete:
              if (hasPayload) messages.push([CompactMessageType.RequestComplete, id, name, value]);
              else messages.push([CompactMessageType.RequestComplete, id, name]);
              break;
            default:
              messages.push([CompactMessageType.RequestError, id, name, value]);
              break;
          }
          break;
        }
        case BinaryMessageType.ResponseData:
        case BinaryMessageType.ResponseComplete:
        case BinaryMessageType.ResponseError: {
          const {payloadStart, payloadSize, id} = readPayloadId(reader, word);
          const hasPayload = payloadSize > 0;
          const value = hasPayload ? readPayload(decoder, reader.uint8, payloadStart, payloadSize) : undefined;
          switch (type) {
            case BinaryMessageType.ResponseData:
              messages.push([CompactMessageType.ResponseData, id, value]);
              break;
            case BinaryMessageType.ResponseComplete:
              if (hasPayload) messages.push([CompactMessageType.ResponseComplete, id, value]);
              else messages.push([CompactMessageType.ResponseComplete, id]);
              break;
            default:
              messages.push([CompactMessageType.ResponseError, id, value]);
              break;
          }
          break;
        }
        case BinaryMessageType.Control: {
          const id = word & 0xffff;
          if (word & 0b1_00000000_00000000) messages.push([CompactMessageType.ResponseUnsubscribe, id]);
          else messages.push([CompactMessageType.RequestUnsubscribe, id]);
          break;
        }
        default:
          throw new Error('UNKNOWN_MSG');
      }
    }
    return messages;
  }
}
