import {Batch} from "../../../json-crdt-patch/Batch";
import {Model} from "../../model";
import {PageEncoder} from "../PageEncoder";

test('..', () => {
  const model = Model.create({});
  model.api.add('/foo', 123);
  model.api.add('/bar', 'abc');

  const patch = model.api.flush();
  // const batch = new Batch([patch]);
  const batch = [patch];
  console.log(patch + '');
  const encoder = new PageEncoder();
  const u8 = encoder.encode(batch);
});
