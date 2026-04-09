import {b} from "@jsonjoy.com/buffers/src/b";
import {ClockVector, s, tick} from "../../../json-crdt-patch";
import {Model} from "../../model";
import {Delta} from "../Delta";

const covers: (upper: ClockVector, lower: ClockVector) => boolean = (upper, lower) => {
  for (const ts of lower.peers.values()) if (!upper.has(ts)) return false;
  const local = tick(lower, -1);
  return upper.has(local);
};

// - [x] new_con — creates a new con node.
// - [x] new_val — creates a new val node.
// - [ ] new_obj — creates a new obj node.
// - [ ] new_vec — creates a new vec node.
// - [ ] new_str — creates a new str node.
// - [ ] new_bin — creates a new bin node.
// - [ ] new_arr — creates a new arr node.
// - [x] ins_val — updates value of a val node.
// - [x] ins_obj — inserts or updates key-value pairs of an obj node.
// - [ ] ins_vec — inserts or updates elements of a vec node.
// - [x] ins_str — inserts text contents into a str node.
// - [x] ins_bin — inserts binary contents into a bin node.
// - [ ] ins_arr — inserts elements into an arr node.
// - [ ] del — deletes contents from list CRDT nodes (str, bin, and arr).
//   - [ ] "str"
//   - [ ] "bin"
//   - [ ] "arr"
// - [ ] nop — does nothing.

test('`new_con` + `ins_obj`', () => {
  const model = Model.create({});
  const model2 = model.fork();
  model2.api.add('/baz', true);
  const delta = Delta.make(model2, model.clock);
  model.applyDelta(delta);
  model.applyDelta(delta);
  expect(model2.view()).toEqual(model.view());
  expect(covers(model.clock, model2.clock)).toBe(true);
});

test('`new_val` + `new_con` + `ins_val` + `ins_obj`', () => {
  const model = Model.create({});
  const model2 = model.fork();
  model2.api.add('/foo', s.val(s.con(0)));
  const delta = Delta.make(model2, model.clock);
  model.applyDelta(delta);
  model.applyDelta(delta);
  expect(model2.view()).toEqual(model.view());
  expect(covers(model.clock, model2.clock)).toBe(true);
});

test('`ins_str` + `del`', () => {
  const model = Model.create('hello world');
  const model2 = model.fork();
  model2.api.merge('', 'Hello, world!');
  const delta = Delta.make(model2, model.clock);
  model.applyDelta(delta);
  expect(model2.view()).toEqual(model.view());
  expect(covers(model.clock, model2.clock)).toBe(true);
});

test('`ins_str` with split chunk "ab"', () => {
  const model = Model.create('');
  model.api.str([]).ins(0, 'a');
  const model2 = model.fork();
  model.api.str([]).ins(1, 'b');

  // Both models have 1 chunk: "ab" and "a", respectively.
  expect(model.api.str([]).node.size()).toBe(1);
  expect(model.view()).toBe('ab');
  expect(model2.api.str([]).node.size()).toBe(1);
  expect(model2.view()).toBe('a');

  const delta = Delta.make(model, model2.clock);
  model2.applyDelta(delta);
  model2.applyDelta(delta);
  model2.applyDelta(delta);
  expect(model.view()).toEqual(model2.view());
  expect(covers(model2.clock, model.clock)).toBe(true);
});

test('`ins_bin` + `del`', () => {
  const model = Model.create(b(0, 2));
  const model2 = model.fork();
  model2.api.merge('', b(0, 1, 2));
  const delta = Delta.make(model2, model.clock);
  model.applyDelta(delta);
  model.applyDelta(delta);
  expect(model2.view()).toEqual(model.view());
  expect(covers(model.clock, model2.clock)).toBe(true);
});

test('`ins_bin` with split chunk', () => {
  const model = Model.create(b());
  model.api.bin([]).ins(0, b(6));
  const model2 = model.fork();
  model.api.bin([]).ins(1, b(9));

  // Both models have 1 chunk: "\x06\x09" and "\x06", respectively.
  expect(model.api.bin([]).node.size()).toBe(1);
  expect(model.view()).toEqual(b(6, 9));
  expect(model2.api.bin([]).node.size()).toBe(1);
  expect(model2.view()).toEqual(b(6));

  const delta = Delta.make(model, model2.clock);
  model2.applyDelta(delta);
  model2.applyDelta(delta);
  model2.applyDelta(delta);
  model2.applyDelta(delta);
  expect(model.view()).toEqual(model2.view());
  expect(covers(model2.clock, model.clock)).toBe(true);
});
