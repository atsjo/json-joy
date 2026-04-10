import {JsonCrdtOperation} from "../../../../operations";
import {Patch} from "../../../../Patch";
import {Batch} from "../../../Batch";
import {Encoder} from "../Encoder";
import {Decoder} from "../Decoder";

const encoder = new Encoder();
const decoder = new Decoder();

export const assertRoundtrip = (ops: JsonCrdtOperation[] = [], patch: Patch = new Patch(ops), batch: Batch = new Batch([patch])) => {
  const encoded = encoder.encodeBatch(batch);
  // console.log(Uint8Array.from(Buffer.concat(batch.patches.map(p => p.toBinary()))));
  // console.log(require('zlib').deflateSync(Uint8Array.from(Buffer.concat(batch.patches.map(p => p.toBinary())))).length);
  // console.log(encoded.length);
  // console.log(require('zlib').deflateSync(encoded).length);
  const decoded = decoder.decodeBatch(encoded);
  expect(decoded).toStrictEqual(batch);
};
