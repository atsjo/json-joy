export type CompactCodecBatch = [
  minSeq: number,
  maxSeq: number,
  sidTable: number[],
  uint: number[],
  s_old: number[],
  s_new: number[],
  t_obj: number[],
  t_id: number[],
  t_val: number[],
  data: unknown[],
  meta: unknown[],
];
