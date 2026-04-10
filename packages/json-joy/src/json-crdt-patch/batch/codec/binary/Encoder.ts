import {CborEncoder} from "@jsonjoy.com/json-pack/lib/cbor/CborEncoder";
import {CrdtWriter} from "../../../../json-crdt-patch/util/binary/CrdtWriter";
import {BatchColumnEncoder} from "../BatchColumnEncoder";
import {Batch} from "../../Batch";

export class Encoder extends CborEncoder<CrdtWriter> {
  constructor(public readonly writer: CrdtWriter = new CrdtWriter()) {
    super(writer);
  }

  public encodeBatch(batch: Batch): Uint8Array {
    this.writer.reset();
    this.writeBatch(batch);
    return this.writer.flush();
  }

  public writeBatch(batch: Batch): void {
    const columns = new BatchColumnEncoder();
    columns.build(batch);
    // console.log(columns);
    const writer = this.writer;
    writer.vu57(columns.minSeq);
    writer.vu57(columns.maxSeq);
    this.writeUintCol(columns.sidTable);
    this.writeUintCol(columns.uint);
    this.writeUintCol(columns.s_old);
    this.writeUintCol(columns.s_new);
    this.writeUintCol(columns.t_obj);
    this.writeUintCol(columns.t_id);
    this.writeUintCol(columns.t_val);
    this.writeCborCol(columns.data);
    this.writeCborCol(columns.meta);
  }

  private writeUintCol(uint: number[]): void {
    const length = uint.length;
    const writer = this.writer;
    writer.ensureCapacity(8 + 8 * length);
    writer.vu57(length);
    for (let i = 0; i < length; i++) writer.vu57(uint[i]);
  }

  private writeCborCol(data: unknown[]): void {
    const length = data.length;
    const writer = this.writer;
    writer.vu57(length);
    for (let i = 0; i < length; i++) this.writeAny(data[i]);
  }
}
