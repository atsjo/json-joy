import {Encoder as BatchEncoder} from "../../../../json-crdt-patch/batch/codec/binary/Encoder";
import type {Delta} from "../../Delta";

export class Encoder extends BatchEncoder {
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
    this.writeBatch(delta.batch);
  }
}
