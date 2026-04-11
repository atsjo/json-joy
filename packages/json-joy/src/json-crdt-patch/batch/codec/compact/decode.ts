import {BatchColumnDecoder} from '../BatchColumnDecoder';
import type {CompactCodecBatch} from './types';
import type {Batch} from '../../Batch';

export const decode = (encoded: CompactCodecBatch): Batch => {
  const columns = new BatchColumnDecoder(
    encoded[0],
    encoded[1],
    encoded[2],
    encoded[3],
    encoded[4],
    encoded[5],
    encoded[6],
    encoded[7],
    encoded[8],
    encoded[9],
    encoded[10],
  );
  const batch = columns.decode();
  return batch;
};
