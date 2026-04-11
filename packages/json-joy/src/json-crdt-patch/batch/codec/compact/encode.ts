import {BatchColumnEncoder} from '../BatchColumnEncoder';
import type {CompactCodecBatch} from './types';
import type {Batch} from '../../Batch';

export const encode = (batch: Batch): CompactCodecBatch => {
  const columns = new BatchColumnEncoder();
  columns.build(batch);
  const encoded: CompactCodecBatch = [
    columns.minSeq,
    columns.maxSeq,
    columns.sidTable,
    columns.uint,
    columns.s_old,
    columns.s_new,
    columns.t_obj,
    columns.t_id,
    columns.t_val,
    columns.data,
    columns.meta,
  ];
  return encoded;
};
