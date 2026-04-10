import {BatchColumnDecoder} from "../BatchColumnDecoder";
import type {VerboseCodecBatch} from "./types";
import type {Batch} from "../../Batch";

export const decode = (encoded: VerboseCodecBatch): Batch => {
  const columns = new BatchColumnDecoder(
    encoded.minSeq,
    encoded.maxSeq,
    encoded.sidTable,
    encoded.uint,
    encoded.s_old,
    encoded.s_new,
    encoded.t_obj,
    encoded.t_id,
    encoded.t_val,
    encoded.data,
    encoded.meta
  );
  const batch = columns.decode();
  return batch;
};
