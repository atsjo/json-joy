import {decode as decodePatch} from "../../../../json-crdt-patch/codec/compact/decode";
import {Delta} from "../../Delta";
import {ClockVector, ts} from "../../../../json-crdt-patch";
import {Batch} from "../../../../json-crdt-patch/Batch";
import type {CompactCodecDelta} from "./types";

export const decode = (encoded: CompactCodecDelta): Delta => {
  const vv0 = ClockVector.from(encoded[0].map(([sid, time]) => ts(sid, time)));
  const vv1 = ClockVector.from(encoded[1].map(([sid, time]) => ts(sid, time)));
  const patches = encoded[2].map(p => decodePatch(p));
  const batch = new Batch(patches);
  const delta = new Delta(vv0, vv1, batch);
  if (encoded.length > 3) delta.meta = encoded[3];
  return delta;
};
