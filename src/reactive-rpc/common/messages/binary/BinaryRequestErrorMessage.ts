import type {BinaryMessage} from './types';
import {getHeaderSize} from '../../codec/binary/header';
import {RequestErrorMessage} from '../nominal';
import type {Encoder} from '../../../../json-pack';

/**
 * @category Message
 */
export class BinaryRequestErrorMessage extends RequestErrorMessage<Uint8Array> implements BinaryMessage {
  public size(): number {
    const dataSize = this.data.byteLength;
    return getHeaderSize(dataSize) + 2 + 1 + this.method.length + dataSize;
  }

  public writeCompact(encoder: Encoder): void {
    const data = this.data;
    const dataSize = data ? data.byteLength : 0;
    if (!dataSize) {
      encoder.encodeArrayHeader(3);
      encoder.encodeUnsignedInteger(this.id);
      encoder.u8(1);
      encoder.encodeAsciiString(this.method);
      return;
    }
    encoder.encodeArrayHeader(4);
    encoder.encodeUnsignedInteger(this.id);
    encoder.u8(1);
    encoder.encodeAsciiString(this.method);
    encoder.buf(data!, dataSize);
  }
}
