import {CborEncoder} from "@jsonjoy.com/json-pack/lib/cbor/CborEncoder";
import {CrdtWriter} from "../../json-crdt-patch/util/binary/CrdtWriter";
import {PageColumnBuilder} from "./PageColumnBuilder";
import type {Page} from "./types";

export class PageEncoder extends CborEncoder<CrdtWriter> {
  constructor(public readonly writer: CrdtWriter = new CrdtWriter()) {
    super(writer);
  }

  public encode(page: Page): Uint8Array {
    this.writer.reset();
    this.write(page);
    return this.writer.flush();
  }

  public write(page: Page): void {
    const columns = new PageColumnBuilder();
    columns.build(page);
    console.log(columns);
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
    this.writeDataCol(columns.data);
  }

  private writeUintCol(uint: number[]): void {
    const length = uint.length;
    const writer = this.writer;
    writer.ensureCapacity(8 + 8 * length);
    writer.vu57(length);
    for (let i = 0; i < length; i++) writer.vu57(uint[i]);
  }

  private writeDataCol(data: unknown[]): void {
    const length = data.length;
    const writer = this.writer;
    writer.vu57(length);
    for (let i = 0; i < length; i++) this.writeAny(data[i]);
  }
}
