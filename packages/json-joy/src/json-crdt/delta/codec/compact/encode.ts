import {encode as encodePatch} from "../../../../json-crdt-patch/codec/compact/encode";
import type {ITimestampStruct} from "../../../../json-crdt-patch";
import type {CompactCodecDelta, CompactCodecTimestamp} from "./types";
import type {Delta} from "../../Delta";

const encodeTimestamp = (ts: ITimestampStruct): CompactCodecTimestamp =>
  [ts.sid, ts.time];

export const encode = (delta: Delta): CompactCodecDelta => {
  const res: CompactCodecDelta = [
    delta.vv0.vv().map(encodeTimestamp),
    delta.vv1.vv().map(encodeTimestamp),
    delta.batch.patches.map(encodePatch),
  ];
  if (delta.meta !== void 0) res.push(delta.meta);
  return res;
};
