import {RpcMessageFormat} from '@jsonjoy.com/rpc-codec-base/lib/constants';
import {Value} from '@jsonjoy.com/json-type';
import * as msg from '@jsonjoy.com/rpc-messages';
import {decode} from './decode';
import {BinaryMessageType} from './constants';
import {BinaryMessageWriter} from './BinaryMessageWriter';
import type {getEncoder} from '@jsonjoy.com/json-type/lib/codegen/binary/shared';
import type {Uint8ArrayCut} from '@jsonjoy.com/buffers/lib/Uint8ArrayCut';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {BinaryMsgCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';

/**
 * Lite binary Reactive JSON RPC codec intended for browser/client use. Uses a
 * injected codec for values, JSON Type values can be untyped.
 */
export class RpcMessageBinaryMsgCodec implements BinaryMsgCodec<msg.RpcMessage> {
  public readonly id = 'rx.binary';
  public readonly format = RpcMessageFormat.Binary;
  private readonly msgWriter: BinaryMessageWriter;

  constructor(
    public readonly codec: JsonValueCodec,
    getTypeEncoder?: typeof getEncoder,
  ) {
    this.msgWriter = new BinaryMessageWriter(getTypeEncoder);
  }

  public toChunk(batch: msg.RpcMessage[]): Uint8Array {
    const codec = this.codec;
    const writer = codec.encoder.writer;
    writer.reset();
    const length = batch.length;
    const msgWriter = this.msgWriter;
    for (let i = 0; i < length; i++) {
      const message = batch[i];
      if (message instanceof msg.NotificationMessage) {
        msgWriter.writeType2(codec, message.method, message.value);
      } else if (message instanceof msg.RequestDataMessage) {
        msgWriter.writeType4(codec, BinaryMessageType.RequestData << 13, message.id, message.method, message.value);
      } else if (message instanceof msg.RequestCompleteMessage) {
        msgWriter.writeType4(codec, BinaryMessageType.RequestComplete << 13, message.id, message.method, message.value);
      } else if (message instanceof msg.RequestErrorMessage) {
        msgWriter.writeType4(codec, BinaryMessageType.RequestError << 13, message.id, message.method, message.value);
      } else if (message instanceof msg.RequestUnsubscribeMessage) {
        codec.encoder.writer.u32(0b11100000_00000000_00000000_00000000 | message.id);
      } else if (message instanceof msg.ResponseCompleteMessage) {
        msgWriter.writeType3(codec, BinaryMessageType.ResponseComplete << 13, message.id, message.value);
      } else if (message instanceof msg.ResponseDataMessage) {
        msgWriter.writeType3(codec, BinaryMessageType.ResponseData << 13, message.id, message.value);
      } else if (message instanceof msg.ResponseErrorMessage) {
        msgWriter.writeType3(codec, BinaryMessageType.ResponseError << 13, message.id, message.value);
      } else if (message instanceof msg.ResponseUnsubscribeMessage) {
        codec.encoder.writer.u32(0b11100000_00000001_00000000_00000000 | message.id);
      }
    }
    return writer.flush();
  }

  public fromChunk(uint8: Uint8Array): msg.RpcMessage[] {
    const codec = this.codec;
    const decoder = codec.decoder;
    const reader = decoder.reader;
    reader.reset(uint8);
    const messages: msg.RpcMessage[] = [];
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
          if (!cut || cut.size === 0) message.value = void 0;
          else {
            const arr = cut.uint8.subarray(cut.start, cut.start + cut.size);
            const data = arr.length ? decoder.read(arr) : undefined;
            if (data === undefined) message.value = void 0;
            else message.value = new Value(data, void 0);
          }
        } else message.value = void 0;
      }
    }
    return messages;
  }
}
