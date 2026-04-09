import {Delta} from "../../Delta";
import {Batch} from "../../../../json-crdt-patch/Batch";
import {ClockVector, Patch} from "../../../../json-crdt-patch";
import {Decoder as PatchDecoder} from "../../../../json-crdt-patch/codec/binary/Decoder";

export class Decoder extends PatchDecoder {
  public decodeDelta(data: Uint8Array): Delta {
    this.reader.reset(data);
    return this.readDelta();
  }

  public readDelta(): Delta {
    const meta = this.val();
    const reader = this.reader;
    const vv0 = ClockVector.from(reader.vv());
    const vv1 = ClockVector.from(reader.vv());
    const length = reader.vu57();
    const patches: Patch[] = [];
    for (let i = 0; i < length; i++) patches.push(this.readPatch());
    const batch = new Batch(patches);
    const delta = new Delta(vv0, vv1, batch);
    delta.meta = meta;
    return delta;
  }
}
