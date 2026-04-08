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
  }
}
