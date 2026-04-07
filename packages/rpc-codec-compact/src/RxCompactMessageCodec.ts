import {RpcMessageFormat} from '@jsonjoy.com/rpc-codec-base/lib/constants';
import {RpcError} from '@jsonjoy.com/rpc-error';
import * as msg from '@jsonjoy.com/rpc-messages';
import {toMessage} from './toMessage';
import {getEncoder as getTypeEncoder} from '@jsonjoy.com/json-type/lib/codegen/binary/shared';
import {CompactMessageType} from './constants';
import type {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import type {MessageCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type * as types from './types';
import type {TlvBinaryJsonEncoder} from '@jsonjoy.com/json-pack';

const encodeCompactWithNameAndPayload = (
  codec: JsonValueCodec,
  type: CompactMessageType,
  msg: msg.RequestDataMessage | msg.RequestCompleteMessage | msg.RequestErrorMessage,
) => {
  const encoder = codec.encoder;
  if (typeof (encoder as any as TlvBinaryJsonEncoder).writeArrHdr === 'function') {
    const binaryEncoder = encoder as any as TlvBinaryJsonEncoder;
    const value = msg.value;
    const hasValue = value !== undefined;
    binaryEncoder.writeArrHdr(hasValue ? 4 : 3);
    encoder.writeUInteger(type);
    encoder.writeUInteger(msg.id);
    encoder.writeAsciiStr(msg.method);
    if (hasValue) {
      if (value.type) getTypeEncoder(codec, value.type)(value.data, encoder);
      else encoder.writeAny(value.data);
    }
  } else if (
    typeof (encoder as any as JsonEncoder).writeStartArr === 'function' &&
    typeof (encoder as any as JsonEncoder).writeArrSeparator === 'function'
  ) {
    const jsonEncoder = encoder as any as JsonEncoder;
    const value = msg.value;
    jsonEncoder.writeStartArr();
    jsonEncoder.writeNumber(type);
    jsonEncoder.writeArrSeparator();
    jsonEncoder.writeNumber(msg.id);
    jsonEncoder.writeArrSeparator();
    jsonEncoder.writeAsciiStr(msg.method);
    const hasValue = value !== undefined;
    if (hasValue) {
      jsonEncoder.writeArrSeparator();
      if (value.type) getTypeEncoder(codec, value.type)(value.data, encoder);
      else jsonEncoder.writeAny(value.data);
    }
    jsonEncoder.writeEndArr();
  } else encoder.writeArr(msg.toCompact());
};

const encodeCompactWithPayload = (
  codec: JsonValueCodec,
  type: CompactMessageType,
  msg: msg.ResponseCompleteMessage | msg.ResponseDataMessage | msg.ResponseErrorMessage,
) => {
  const encoder = codec.encoder;
  if (typeof (encoder as any as TlvBinaryJsonEncoder).writeArrHdr === 'function') {
    const binaryEncoder = encoder as any as TlvBinaryJsonEncoder;
    const value = msg.value;
    const hasValue = value !== undefined;
    binaryEncoder.writeArrHdr(hasValue ? 3 : 2);
    encoder.writeUInteger(type);
    encoder.writeUInteger(msg.id);
    if (hasValue) {
      if (value.type) {
        getTypeEncoder(codec, value.type)(value.data, encoder);
      } else {
        encoder.writeAny(value.data);
      }
    }
  } else if (
    typeof (encoder as any as JsonEncoder).writeStartArr === 'function' &&
    typeof (encoder as any as JsonEncoder).writeArrSeparator === 'function'
  ) {
    const jsonEncoder = encoder as any as JsonEncoder;
    const value = msg.value;
    jsonEncoder.writeStartArr();
    jsonEncoder.writeNumber(type);
    jsonEncoder.writeArrSeparator();
    jsonEncoder.writeNumber(msg.id);
    const hasValue = value !== undefined;
    if (hasValue) {
      jsonEncoder.writeArrSeparator();
      if (value.type) getTypeEncoder(codec, value.type)(value.data, jsonEncoder);
      else encoder.writeAny(value.data);
    }
    jsonEncoder.writeEndArr();
  } else encoder.writeArr(msg.toCompact());
};

export class RxCompactMessageCodec implements MessageCodec<msg.RxMessage> {
  id = 'rx.compact';
  format = RpcMessageFormat.Compact;

  public write(codec: JsonValueCodec, message: msg.RxMessage): void {
    if (message instanceof msg.NotificationMessage) {
      const encoder = codec.encoder;
      if (typeof (encoder as any as TlvBinaryJsonEncoder).writeArrHdr === 'function') {
        const binaryEncoder = encoder as any as TlvBinaryJsonEncoder;
        const value = message.value;
        const hasValue = value !== undefined;
        binaryEncoder.writeArrHdr(hasValue ? 3 : 2);
        encoder.writeUInteger(CompactMessageType.Notification);
        encoder.writeAsciiStr(message.method);
        if (hasValue) {
          if (value.type) getTypeEncoder(codec, value.type)(value.data, encoder);
          else encoder.writeAny(value.data);
        }
      } else if (
        typeof (encoder as any as JsonEncoder).writeStartArr === 'function' &&
        typeof (encoder as any as JsonEncoder).writeArrSeparator === 'function'
      ) {
        const jsonEncoder = encoder as any as JsonEncoder;
        const value = message.value;
        jsonEncoder.writeStartArr();
        jsonEncoder.writeNumber(CompactMessageType.Notification);
        jsonEncoder.writeArrSeparator();
        jsonEncoder.writeAsciiStr(message.method);
        const hasValue = value !== undefined;
        if (hasValue) {
          jsonEncoder.writeArrSeparator();
          if (value.type) getTypeEncoder(codec, value.type)(value.data, jsonEncoder);
          else encoder.writeAny(value.data);
        }
        jsonEncoder.writeEndArr();
      } else encoder.writeArr(message.toCompact());
    } else if (message instanceof msg.RequestDataMessage) {
      encodeCompactWithNameAndPayload(codec, CompactMessageType.RequestData, message);
    } else if (message instanceof msg.RequestCompleteMessage) {
      encodeCompactWithNameAndPayload(codec, CompactMessageType.RequestComplete, message);
    } else if (message instanceof msg.RequestErrorMessage) {
      encodeCompactWithNameAndPayload(codec, CompactMessageType.RequestError, message);
      codec.encoder.writeArr(message.toCompact());
    } else if (message instanceof msg.ResponseCompleteMessage) {
      encodeCompactWithPayload(codec, CompactMessageType.ResponseComplete, message);
    } else if (message instanceof msg.ResponseDataMessage) {
      encodeCompactWithPayload(codec, CompactMessageType.ResponseData, message);
    } else if (message instanceof msg.ResponseErrorMessage) {
      encodeCompactWithPayload(codec, CompactMessageType.ResponseError, message);
    } else if (message instanceof msg.RequestUnsubscribeMessage || message instanceof msg.ResponseUnsubscribeMessage) {
      codec.encoder.writeArr(message.toCompact());
    }
  }

  public writeBatch(jsonCodec: JsonValueCodec, batch: msg.RxMessage[]): void {
    const encoder = jsonCodec.encoder;
    if (typeof (encoder as any as TlvBinaryJsonEncoder).writeArrHdr === 'function') {
      const binaryEncoder = encoder as any as TlvBinaryJsonEncoder;
      const length = batch.length;
      binaryEncoder.writeArrHdr(length);
      for (let i = 0; i < length; i++) this.write(jsonCodec, batch[i]);
    } else if (
      typeof (encoder as any as JsonEncoder).writeStartArr === 'function' &&
      typeof (encoder as any as JsonEncoder).writeArrSeparator === 'function'
    ) {
      const jsonEncoder = encoder as any as JsonEncoder;
      const length = batch.length;
      const last = length - 1;
      jsonEncoder.writeStartArr();
      for (let i = 0; i < last; i++) {
        this.write(jsonCodec, batch[i]);
        jsonEncoder.writeArrSeparator();
      }
      if (length > 0) this.write(jsonCodec, batch[last]);
      jsonEncoder.writeEndArr();
    } else {
      const jsonMessages: types.CompactMessage[] = [];
      const length = batch.length;
      for (let i = 0; i < length; i++) jsonMessages.push(batch[i].toCompact());
      const encoder = jsonCodec.encoder;
      encoder.writeArr(jsonMessages);
    }
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
    const value = decoder.readAny();
    if (!(value instanceof Array)) throw RpcError.badRequest();
    if (typeof value[0] === 'number') return [toMessage(value as unknown[])];
    const result: msg.RxMessage[] = [];
    const length = value.length;
    for (let i = 0; i < length; i++) {
      const item = value[i];
      result.push(toMessage(item as unknown));
    }
    return result;
  }

  public decode(jsonCodec: JsonValueCodec, uint8: Uint8Array): msg.RxMessage[] {
    jsonCodec.decoder.reader.reset(uint8);
    return this.read(jsonCodec);
  }
}
