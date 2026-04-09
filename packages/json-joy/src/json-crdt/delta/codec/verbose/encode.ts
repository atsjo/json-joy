import {encode as encodePatch} from "../../../../json-crdt-patch/codec/verbose/encode";
import type {ITimestampStruct} from "../../../../json-crdt-patch";
import type {VerboseCodecDelta, VerboseCodecTimestamp} from "./types";
import type {Delta} from "../../Delta";

const encodeTimestamp = (ts: ITimestampStruct): VerboseCodecTimestamp =>
  [ts.sid, ts.time];

export const encode = (delta: Delta): VerboseCodecDelta => {
  const res: VerboseCodecDelta = {
    vv0: delta.vv0.vv().map(encodeTimestamp),
    vv1: delta.vv1.vv().map(encodeTimestamp),
    batch: {
      patches: delta.batch.patches.map(encodePatch),
    },
  };
  if (delta.meta !== void 0) res.meta = delta.meta;
  return res;
};
