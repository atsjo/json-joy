import {ts} from "../../../../clock";
import {InsStrOp, JsonCrdtOperation, NewConOp, NewStrOp} from "../../../../operations";
import {Patch} from "../../../../Patch";
import {Batch} from "../../../Batch";
import {Encoder} from "../Encoder";
import {Decoder} from "../Decoder";

const encoder = new Encoder();
const decoder = new Decoder();

const assertRoundtrip = (ops: JsonCrdtOperation[]) => {
  const patch = new Patch(ops);
  const batch = new Batch([patch]);
  const encoded = encoder.encode(batch);
  const decoded = decoder.decodeBatch(encoded);
  expect(decoded).toStrictEqual(batch);
};

test('`new_con`', () => {
  const op = new NewConOp(ts(1, 1), 42);
  assertRoundtrip([op]);
});

test('`new_str` + `ins_str`', () => {
  const op1 = new NewStrOp(ts(4, 5));
  const op2 = new InsStrOp(ts(4, 6), ts(6, 7), ts(8, 9), 'Hello, world!');
  assertRoundtrip([op1, op2]);
});
