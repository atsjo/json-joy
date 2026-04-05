import {RpcMessageFormat} from '@jsonjoy.com/rpc-codec-base/lib/constants';
import * as msg from '@jsonjoy.com/rpc-messages';
import {decode} from './decode';
import {BinaryMessageType} from './constants';
import {BinaryMessageWriter} from './BinaryMessageWriter';
import type {getEncoder} from '@jsonjoy.com/json-type/lib/codegen/binary/shared';
import type {Uint8ArrayCut} from '@jsonjoy.com/buffers/lib/Uint8ArrayCut';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {StreamCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';

export class RxBinaryStreamCodec implements StreamCodec<msg.RxMessage> {
  id = 'rx.binary';
  format = RpcMessageFormat.Binary;

  private readonly msgWriter: BinaryMessageWriter;

  constructor(getTypeEncoder?: typeof getEncoder) {
    this.msgWriter = new BinaryMessageWriter(getTypeEncoder);
  }

  public write(codec: JsonValueCodec, message: msg.RxMessage): void {
    const writer = this.msgWriter;
    if (message instanceof msg.NotificationMessage) {
      writer.writeType2(codec, message.method, message.value);
    } else if (message instanceof msg.RequestDataMessage) {
      writer.writeType4(codec, BinaryMessageType.RequestData << 13, message.id, message.method, message.value);
    } else if (message instanceof msg.RequestCompleteMessage) {
      writer.writeType4(codec, BinaryMessageType.RequestComplete << 13, message.id, message.method, message.value);
    } else if (message instanceof msg.RequestErrorMessage) {
      writer.writeType4(codec, BinaryMessageType.RequestError << 13, message.id, message.method, message.value);
    } else if (message instanceof msg.RequestUnsubscribeMessage) {
      codec.encoder.writer.u32(0b11100000_00000000_00000000_00000000 | message.id);
    } else if (message instanceof msg.ResponseCompleteMessage) {
      writer.writeType3(codec, BinaryMessageType.ResponseComplete << 13, message.id, message.value);
    } else if (message instanceof msg.ResponseDataMessage) {
      writer.writeType3(codec, BinaryMessageType.ResponseData << 13, message.id, message.value);
    } else if (message instanceof msg.ResponseErrorMessage) {
      writer.writeType3(codec, BinaryMessageType.ResponseError << 13, message.id, message.value);
    } else if (message instanceof msg.ResponseUnsubscribeMessage) {
      codec.encoder.writer.u32(0b11100000_00000001_00000000_00000000 | message.id);
    }
  }

  public writeBatch(codec: JsonValueCodec, batch: msg.RxMessage[]): void {
    const length = batch.length;
    for (let i = 0; i < length; i++) this.write(codec, batch[i]);
  }

  public encode(jsonCodec: JsonValueCodec, batch: msg.RxMessage[]): Uint8Array {
    const encoder = jsonCodec.encoder;
    const writer = encoder.writer;
    writer.reset();
    this.writeBatch(jsonCodec, batch);
    return writer.flush();
  }

  public read(codec: JsonValueCodec): msg.RxMessage[] {
    const decoder = codec.decoder;
    const reader = decoder.reader;
    const messages: msg.RxMessage[] = [];
    while (reader.x < reader.uint8.length) {
      const message = decode(reader);
      messages.push(message);
    }
    const length = messages.length;
    for (let i = 0; i < length; i++) {
      const message = messages[i];
      if (
        message instanceof msg.NotificationMessage ||
        message instanceof msg.RequestCompleteMessage ||
        message instanceof msg.RequestDataMessage ||
        message instanceof msg.RequestErrorMessage ||
        message instanceof msg.ResponseCompleteMessage ||
        message instanceof msg.ResponseDataMessage ||
        message instanceof msg.ResponseErrorMessage
      ) {
        const value = message.value;
        if (value) {
          const cut = value.data as Uint8ArrayCut;
          // if (!cut || cut.size === 0) message.value = unknown(undefined);
          if (!cut || cut.size === 0) message.value = void 0;
          else {
            const arr = cut.uint8.subarray(cut.start, cut.start + cut.size);
            const data = arr.length ? decoder.read(arr) : undefined;
            // if (data === undefined) message.value = unknown(undefined);
            if (data === undefined) message.value = void 0;
            else value.data = data;
          }
        }
        // message.value = unknown(undefined);
        else message.value = void 0;
      }
    }
    return messages;
  }

  public readChunk(jsonCodec: JsonValueCodec, uint8: Uint8Array): msg.RxMessage[] {
    jsonCodec.decoder.reader.reset(uint8);
    return this.read(jsonCodec);
  }
}
