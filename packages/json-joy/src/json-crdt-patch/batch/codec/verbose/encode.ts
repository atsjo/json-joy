import {BatchColumnEncoder} from "../BatchColumnEncoder";
import type {VerboseCodecBatch} from "./types";
import type {Batch} from "../../Batch";

export const encode = (batch: Batch): VerboseCodecBatch => {
  const columns = new BatchColumnEncoder();
  columns.build(batch);
  const encoded: VerboseCodecBatch = {
    minSeq: columns.minSeq,
    maxSeq: columns.maxSeq,
    sidTable: columns.sidTable,
    uint: columns.uint,
    s_old: columns.s_old,
    s_new: columns.s_new,
    t_obj: columns.t_obj,
    t_id: columns.t_id,
    t_val: columns.t_val,
    data: columns.data,
    meta: columns.meta,
  };
  return encoded;
};
