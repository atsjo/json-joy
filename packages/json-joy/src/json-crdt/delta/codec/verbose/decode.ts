import {decode as decodePatch} from '../../../../json-crdt-patch/codec/verbose/decode';
import {Delta} from '../../Delta';
import {ClockVector, ts} from '../../../../json-crdt-patch';
import {Batch} from '../../../../json-crdt-patch/Batch';
import type {VerboseCodecDelta} from './types';

export const decode = (encoded: VerboseCodecDelta): Delta => {
  const vv0 = ClockVector.from(encoded.vv0.map(([sid, time]) => ts(sid, time)));
  const vv1 = ClockVector.from(encoded.vv1.map(([sid, time]) => ts(sid, time)));
  const patches = encoded.batch.patches.map((p) => decodePatch(p));
  const batch = new Batch(patches);
  const delta = new Delta(vv0, vv1, batch);
  delta.meta = encoded.meta;
  return delta;
};
