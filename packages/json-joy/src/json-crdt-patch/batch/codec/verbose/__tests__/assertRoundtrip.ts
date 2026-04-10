import {JsonCrdtOperation} from "../../../../operations";
import {Patch} from "../../../../Patch";
import {Batch} from "../../../Batch";
import {encode} from '../encode';
import {decode} from "../decode";


export const assertRoundtrip = (ops: JsonCrdtOperation[] = [], patch: Patch = new Patch(ops), batch: Batch = new Batch([patch])) => {
  const encoded = encode(batch);
  const decoded = decode(encoded);
  expect(decoded).toStrictEqual(batch);
};
