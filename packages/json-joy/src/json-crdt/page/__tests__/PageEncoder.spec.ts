import {Batch} from "../../../json-crdt-patch/Batch";
import {Model} from "../../model";
import {PageEncoder} from "../PageEncoder";

test('..', () => {
  const model = Model.create({});
  model.api.add('/foo', 123);
  model.api.add('/bar', 'abc');
  model.api.add('/baz', 'xyz');
  model.api.add('/obj', {});
  model.api.add('/obj/name', 'json-joy');

  const patch1 = model.api.flush();
  
  model.api.add('/foo', 456);
  model.api.add('/bar', 'def');
  model.api.add('/baz', 'uvw');
  
  const patch2 = model.api.flush();

  const patch3 = model.api.str('/obj/name').merge('Hello, json-joy!')!;

  // const batch = new Batch([patch]);
  const batch = [patch1, patch2, patch3];
  console.log(patch1 + '');
  console.log(patch2 + '');
  console.log(patch3 + '');

  const encoder = new PageEncoder();
  const u8 = encoder.encode(batch);

  console.log(model + '');
  console.log(patch1.toBinary());
  console.log(patch2.toBinary());
  console.log(patch3.toBinary());
  console.log(u8);
  // gzipped
  console.log(new Uint8Array(require('zlib').gzipSync(u8)));
  // three patches gzipped
  const buf = Buffer.from([...patch1.toBinary(), ...patch2.toBinary(), ...patch3.toBinary()])
  console.log(new Uint8Array([...buf]));
  console.log(new Uint8Array(require('zlib').gzipSync(buf)));
});
