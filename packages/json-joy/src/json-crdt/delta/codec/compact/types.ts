import type {CompactCodecPatch} from '../../../../json-crdt-patch/codec/compact/types';

export type CompactCodecDelta = [
  vv0: CompactCodecVersionVector,
  vv1: CompactCodecVersionVector,
  batch: CompactCodecPatch[],
  meta?: unknown,
];

export type CompactCodecVersionVector = CompactCodecTimestamp[];

export type CompactCodecTimestamp = [
  /** A random site ID. */
  sessionId: number,
  /** A logical clock sequence number. */
  time: number,
];
