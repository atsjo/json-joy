import {Encoder as PatchEncoder} from "../../../../json-crdt-patch/codec/binary/Encoder";
import type {Delta} from "../../Delta";

export class Encoder extends PatchEncoder {
  public encodeDelta(delta: Delta): Uint8Array {
    const writer = this.writer;
    writer.reset();
    this.writeDelta(delta);
    return writer.flush();
  }

  public writeDelta(delta: Delta): void {
    const writer = this.writer;
    this.writeAny(delta.meta);
    writer.vv(delta.vv0.vv());
    writer.vv(delta.vv1.vv());
    const patches = delta.batch.patches;
    const length = patches.length;
    writer.vu57(length);
    for (let i = 0; i < length; i++) this.writePatch(patches[i]);
  }
}
