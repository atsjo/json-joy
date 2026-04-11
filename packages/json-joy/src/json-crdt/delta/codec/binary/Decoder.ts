import {Delta} from '../../Delta';
import {ClockVector} from '../../../../json-crdt-patch';
import {Decoder as BatchDecoder} from '../../../../json-crdt-patch/batch/codec/binary/Decoder';

export class Decoder extends BatchDecoder {
  public decodeDelta(data: Uint8Array): Delta {
    this.reader.reset(data);
    return this.readDelta();
  }

  public readDelta(): Delta {
    const meta = this.val();
    const reader = this.reader;
    const vv0 = ClockVector.from(reader.vv());
    const vv1 = ClockVector.from(reader.vv());
    const batch = this.readBatch();
    const delta = new Delta(vv0, vv1, batch);
    delta.meta = meta;
    return delta;
  }
}
