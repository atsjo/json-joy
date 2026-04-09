import type {JsonCodecPatch} from "../../../../json-crdt-patch/codec/verbose";

export interface VerboseCodecDelta {
  meta?: unknown;
  vv0: VerboseCodecVersionVector;
  vv1: VerboseCodecVersionVector;
  batch: {
    patches: JsonCodecPatch[];
  };
}

export type VerboseCodecVersionVector = VerboseCodecTimestamp[];

export type VerboseCodecTimestamp =
[
  /** A random site ID. */
  sessionId: number,
  /** A logical clock sequence number. */
  time: number,
];
