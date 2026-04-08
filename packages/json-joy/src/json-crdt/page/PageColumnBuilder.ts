import {JsonCrdtOperation, JsonCrdtOperationGroup, Timestamp} from "../../json-crdt-patch";
import {JsonCrdtPatchOpcodeOverlay} from "../../json-crdt-patch/enums";
import * as operations from "../../json-crdt-patch/operations";
import type {Page} from "./types";

export class PageColumnBuilder {
  // ------------------------------------------------------ Header - page stats
  public minSeq: number = 0;
  public maxSeq: number = 0;
  public readonly sids: Set<number> = new Set();
  // public readonly sidTable: number[] = [];
  public readonly sidMap: Map<number, number> = new Map();
  
  // ------------------------------------------------------------------ Columns

  /**
   * Unsigned integers - used for multiple purposes:
   * 
   * - Group size - number of operations in group
   * - Operation size - number of data elements in operation
   * - Opcodes - type of each operation in the group
   */
  public readonly uint: number[] = [];

  /** Old timestamp (`obj` and `ref` fields) SID (session ID). */
  public readonly osid: number[] = [];

  /** Old timestamp (`obj` and `ref` fields) sequence number (`time` component). */
  public readonly oseq: number[] = [];

  /** New timestamp (`id` and `val` fields) SID (session ID). */
  public readonly nsid: number[] = [];

  /** New timestamp (`id` and `val` fields) sequence number (`time` component). */
  public readonly nseq: number[] = [];

  /** JSON data or ID (encoded as CBOR). */
  public readonly data: unknown[] = [];

  public build(page: Page): void {
    const length = page.length;
    for (let i = 0; i < length; i++) this.buildGroup(page[i]);
  }

  private buildGroup(group: JsonCrdtOperationGroup): void {
    const {ops, meta} = group;
    const length = ops.length;
    this.uint.push(length);
    this.data.push(meta ?? null);
    for (let i = 0; i < length; i++) this.buildOp(ops[i]);
    const {sidMap, osid, nsid} = this;
    const sidTable = [...this.sids];
    this.sids.clear();
    sidTable.sort();
    const sidTableLength = sidTable.length;
    for (let i = 0; i < sidTableLength; i++) sidMap.set(sidTable[i], i);
    const osidLength = osid.length;
    for (let i = 0; i < osidLength; i++) osid[i] = sidMap.get(osid[i])!;
    const nsidLength = nsid.length;
    for (let i = 0; i < nsidLength; i++) nsid[i] = sidMap.get(nsid[i])!;
  }

  private buildOp(op: JsonCrdtOperation): void {
    const {uint: size, uint: type, data} = this;
    this.writeTsNew(op.id);
    switch (op.constructor) {
      case operations.NewConOp: {
        const operation = op as operations.NewConOp;
        const val = operation.val;
        if (val instanceof Timestamp) {
          type.push(JsonCrdtPatchOpcodeOverlay.new_val + 1);
          this.writeTsNew(val);
        } else {
          type.push(JsonCrdtPatchOpcodeOverlay.new_val);
          data.push(val);
        }
        break;
      }
      case operations.NewValOp: {
        type.push(JsonCrdtPatchOpcodeOverlay.new_val);
        break;
      }
      case operations.NewObjOp: {
        type.push(JsonCrdtPatchOpcodeOverlay.new_obj);
        break;
      }
      case operations.NewVecOp: {
        type.push(JsonCrdtPatchOpcodeOverlay.new_vec);
        break;
      }
      case operations.NewStrOp: {
        type.push(JsonCrdtPatchOpcodeOverlay.new_str);
        break;
      }
      case operations.NewBinOp: {
        type.push(JsonCrdtPatchOpcodeOverlay.new_bin);
        break;
      }
      case operations.NewArrOp: {
        type.push(JsonCrdtPatchOpcodeOverlay.new_arr);
        break;
      }
      case operations.InsValOp: {
        type.push(JsonCrdtPatchOpcodeOverlay.ins_val);
        const {obj, val} = op as operations.InsValOp;
        this.writeTsOld(obj);
        this.writeTsNew(val);
        break;
      }
      case operations.InsObjOp: {
        const {obj, data: opData} = op as operations.InsObjOp;
        const length = opData.length;
        if (length <= 0b111) {
          type.push(JsonCrdtPatchOpcodeOverlay.ins_obj + length);
        } else {
          type.push(JsonCrdtPatchOpcodeOverlay.ins_obj);
          size.push(length);
        }
        this.writeTsOld(obj);
        for (let i = 0; i < length; i++) {
          const tuple = opData[i];
          data.push(tuple[0]);
          this.writeTsNew(tuple[1]);
        }
        break;
      }
      case operations.InsVecOp: {
        const {obj, data: opData} = op as operations.InsVecOp;
        const length = opData.length;
        if (length <= 0b111) {
          type.push(JsonCrdtPatchOpcodeOverlay.ins_vec + length);
        } else {
          type.push(JsonCrdtPatchOpcodeOverlay.ins_vec);
          size.push(length);
        }
        this.writeTsOld(obj);
        for (let i = 0; i < length; i++) {
          const tuple = opData[i];
          size.push(tuple[0]);
          this.writeTsNew(tuple[1]);
        }
        break;
      }
      case operations.InsStrOp: {
        type.push(JsonCrdtPatchOpcodeOverlay.ins_str);
        const operation = op as operations.InsStrOp;
        this.writeTsOld(operation.obj);
        this.writeTsOld(operation.ref);
        data.push(operation.data);
        break;
      }
      case operations.InsBinOp: {
        type.push(JsonCrdtPatchOpcodeOverlay.ins_bin);
        const operation = op as operations.InsBinOp;
        this.writeTsOld(operation.obj);
        this.writeTsOld(operation.ref);
        data.push(operation.data);
        break;
      }
      case operations.InsArrOp: {
        const operation = op as operations.InsArrOp;
        const {obj, ref, data: vals} = operation;
        const length = vals.length;
        if (length <= 0b111) {
          type.push(JsonCrdtPatchOpcodeOverlay.ins_arr + length);
        } else {
          type.push(JsonCrdtPatchOpcodeOverlay.ins_arr);
          size.push(length);
        }
        this.writeTsOld(obj);
        this.writeTsOld(ref);
        for (let i = 0; i < length; i++) this.writeTsNew(vals[i]);
        break;
      }
      case operations.UpdArrOp: {
        type.push(JsonCrdtPatchOpcodeOverlay.upd_arr);
        const operation = op as operations.UpdArrOp;
        const {obj, ref, val} = operation;
        this.writeTsOld(obj);
        this.writeTsOld(ref);
        this.writeTsNew(val);
        break;
      }
      case operations.DelOp: {
        const {obj, what} = op as operations.DelOp;
        const length = what.length;
        if (length <= 0b111) {
          type.push(JsonCrdtPatchOpcodeOverlay.del + length);
        } else {
          type.push(JsonCrdtPatchOpcodeOverlay.del);
          size.push(length);
        }
        this.writeTsOld(obj);
        for (let i = 0; i < length; i++) {
          const timespan = what[i];
          this.writeTsOld(timespan);
          size.push(timespan.span);
        }
        break;
      }
      case operations.NopOp: {
        const {len} = op as operations.NopOp;
        if (len <= 0b111) {
          type.push(JsonCrdtPatchOpcodeOverlay.nop + len);
        } else {
          type.push(JsonCrdtPatchOpcodeOverlay.nop);
          size.push(len);
        }
        break;
      }
      default: {
        throw new Error('UNKNOWN_OP');
      }
    }
  }

  private writeTsNew({sid, time}: Timestamp): void {
    this.nsid.push(sid);
    this.nseq.push(time);
    this.sids.add(sid);
    if (!this.minSeq || time < this.minSeq) this.minSeq = time;
    this.maxSeq = Math.max(this.maxSeq, time);
  }

  private writeTsOld({sid, time}: Timestamp): void {
    this.osid.push(sid);
    this.oseq.push(time);
    this.sids.add(sid);
    if (!this.minSeq || time < this.minSeq) this.minSeq = time;
    this.maxSeq = Math.max(this.maxSeq, time);
  }
}