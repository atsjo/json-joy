import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {CrdtReader} from '../../../util/binary/CrdtReader';
import type {Batch} from '../../Batch';
import {BatchColumnDecoder} from '../BatchColumnDecoder';

/**
 * JSON CRDT Batch "binary" codec decoder.
 */
export class Decoder extends CborDecoder<CrdtReader> {
  /**
   * Creates a new JSON CRDT batch decoder.
   *
   * @param reader An optional custom implementation of a CRDT decoder.
   */
  constructor(reader: CrdtReader = new CrdtReader()) {
    super(reader);
  }

  /**
   * Decodes a JSON CRDT batch from a binary blob.
   *
   * @param data Binary data to decode.
   * @returns A JSON CRDT `Batch`.
   */
  public decodeBatch(data: Uint8Array): Batch {
    this.reader.reset(data);
    return this.readBatch();
  }

  public readBatch(): Batch {
    const reader = this.reader;
    const minSeq = reader.vu57();
    const maxSeq = reader.vu57();
    const sidTable = this.readUintCol();
    const uint = this.readUintCol();
    const s_old = this.readUintCol();
    const s_new = this.readUintCol();
    const t_obj = this.readUintCol();
    const t_id = this.readUintCol();
    const t_val = this.readUintCol();
    const data = this.readCborCol();
    const meta = this.readCborCol();
    const columns = new BatchColumnDecoder(
      minSeq,
      maxSeq,
      sidTable,
      uint,
      s_old,
      s_new,
      t_obj,
      t_id,
      t_val,
      data,
      meta,
    );
    return columns.decode();
  }

  private readUintCol(): number[] {
    const reader = this.reader;
    const length = reader.vu57();
    const uint: number[] = [];
    for (let i = 0; i < length; i++) uint.push(reader.vu57());
    return uint;
  }

  private readCborCol(): unknown[] {
    const length = this.reader.vu57();
    const data: unknown[] = [];
    for (let i = 0; i < length; i++) data.push(this.readAny());
    return data;
  }
}
