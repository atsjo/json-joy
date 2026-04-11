import {type ITimespanStruct, type ITimestampStruct, ts, tss} from '../../clock';
import {JsonCrdtPatchOpcodeOverlay} from '../../enums';
import * as operations from '../../operations';
import {Patch} from '../../Patch';
import {Batch} from '../Batch';
import {dd, drld, rld, zd} from '../util';

export class BatchColumnDecoder {
  private uintIdx: number = 0;
  private s_oldIdx: number = 0;
  private s_newIdx: number = 0;
  private t_objIdx: number = 0;
  private t_idIdx: number = 0;
  private t_valIdx: number = 0;
  private dataIdx: number = 0;
  private metaIdx: number = 0;

  constructor(
    // ---------------------------------------------------- Header - page stats
    public minSeq: number,
    public maxSeq: number,

    // ---------------------------------------------------------------- Columns
    public sidTable: number[],
    public readonly uint: number[],
    public s_old: number[],
    public s_new: number[],
    public t_obj: number[],
    public t_id: number[],
    public t_val: number[],
    public readonly data: unknown[],
    public meta: unknown[],
  ) {}

  public decode(): Batch {
    this.s_old = rld(zd(this.s_old));
    this.s_new = rld(zd(this.s_new));
    this.t_obj = dd(zd(rld(zd(this.t_obj))));
    this.t_id = dd(zd(rld(zd(this.t_id))));
    this.t_val = dd(zd(rld(zd(this.t_val))));
    this.meta = drld(this.meta);
    const batchMeta = this.meta[this.metaIdx++];
    const patchCount = this.uint[this.uintIdx++];
    const patches: Patch[] = [];
    for (let i = 0; i < patchCount; i++) patches.push(this.decodeGroup());
    const batch = new Batch(patches);
    if (batchMeta != null) batch.meta = batchMeta;
    return batch;
  }

  public decodeGroup(): Patch {
    const opCount = this.uint[this.uintIdx++];
    const meta = this.meta[this.metaIdx++];
    const ops: operations.JsonCrdtOperation[] = [];
    for (let i = 0; i < opCount; i++) ops.push(this.decodeOp());
    return new Patch(ops, meta !== null ? meta : undefined);
  }

  private decodeOp(): operations.JsonCrdtOperation {
    const id = this.readId();
    const uint = this.uint;
    const opRaw = uint[this.uintIdx++];
    const base = opRaw & ~0b111;
    const extra = opRaw & 0b111;
    switch (base) {
      case JsonCrdtPatchOpcodeOverlay.new_con: {
        if (extra === 1) return new operations.NewConOp(id, this.readTsNew());
        return new operations.NewConOp(id, this.data[this.dataIdx++]);
      }
      case JsonCrdtPatchOpcodeOverlay.new_val: {
        return new operations.NewValOp(id);
      }
      case JsonCrdtPatchOpcodeOverlay.new_obj: {
        return new operations.NewObjOp(id);
      }
      case JsonCrdtPatchOpcodeOverlay.new_vec: {
        return new operations.NewVecOp(id);
      }
      case JsonCrdtPatchOpcodeOverlay.new_str: {
        return new operations.NewStrOp(id);
      }
      case JsonCrdtPatchOpcodeOverlay.new_bin: {
        return new operations.NewBinOp(id);
      }
      case JsonCrdtPatchOpcodeOverlay.new_arr: {
        return new operations.NewArrOp(id);
      }
      case JsonCrdtPatchOpcodeOverlay.ins_val: {
        return new operations.InsValOp(id, this.readTsOld(), this.readTsNew());
      }
      case JsonCrdtPatchOpcodeOverlay.ins_obj: {
        const length = extra || uint[this.uintIdx++];
        const obj = this.readTsOld();
        const opData: [string, ITimestampStruct][] = [];
        for (let i = 0; i < length; i++) opData.push([this.data[this.dataIdx++] as string, this.readTsNew()]);
        return new operations.InsObjOp(id, obj, opData);
      }
      case JsonCrdtPatchOpcodeOverlay.ins_vec: {
        const length = extra || uint[this.uintIdx++];
        const obj = this.readTsOld();
        const opData: [number, ITimestampStruct][] = [];
        for (let i = 0; i < length; i++) opData.push([uint[this.uintIdx++], this.readTsNew()]);
        return new operations.InsVecOp(id, obj, opData);
      }
      case JsonCrdtPatchOpcodeOverlay.ins_str: {
        return new operations.InsStrOp(id, this.readTsOld(), this.readTsOld(), this.data[this.dataIdx++] as string);
      }
      case JsonCrdtPatchOpcodeOverlay.ins_bin: {
        return new operations.InsBinOp(id, this.readTsOld(), this.readTsOld(), this.data[this.dataIdx++] as Uint8Array);
      }
      case JsonCrdtPatchOpcodeOverlay.ins_arr: {
        const length = extra || uint[this.uintIdx++];
        const obj = this.readTsOld();
        const ref = this.readTsOld();
        const vals: ITimestampStruct[] = [];
        for (let i = 0; i < length; i++) vals.push(this.readTsNew());
        return new operations.InsArrOp(id, obj, ref, vals);
      }
      case JsonCrdtPatchOpcodeOverlay.upd_arr: {
        return new operations.UpdArrOp(id, this.readTsOld(), this.readTsOld(), this.readTsNew());
      }
      case JsonCrdtPatchOpcodeOverlay.del: {
        const length = extra || uint[this.uintIdx++];
        const obj = this.readTsOld();
        const what: ITimespanStruct[] = [];
        for (let i = 0; i < length; i++) {
          const {sid, time} = this.readTsOld();
          what.push(tss(sid, time, uint[this.uintIdx++]));
        }
        return new operations.DelOp(id, obj, what);
      }
      case JsonCrdtPatchOpcodeOverlay.nop: {
        return new operations.NopOp(id, extra || uint[this.uintIdx++]);
      }
      default: {
        throw new Error('UNKNOWN_OP');
      }
    }
  }

  private readId(): ITimestampStruct {
    return ts(this.sidTable[this.s_new[this.s_newIdx++]], this.t_id[this.t_idIdx++]);
  }

  private readTsNew(): ITimestampStruct {
    return ts(this.sidTable[this.s_new[this.s_newIdx++]], this.t_val[this.t_valIdx++]);
  }

  private readTsOld(): ITimestampStruct {
    return ts(this.sidTable[this.s_old[this.s_oldIdx++]], this.t_obj[this.t_objIdx++]);
  }
}
