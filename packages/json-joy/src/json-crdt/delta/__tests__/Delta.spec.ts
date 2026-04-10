import {b} from "@jsonjoy.com/buffers/src/b";
import {ClockVector, s, tick, ts} from "../../../json-crdt-patch";
import {Model} from "../../model";
import {Delta} from "../Delta";

const covers: (upper: ClockVector, lower: ClockVector) => boolean = (upper, lower) => {
  for (const ts of lower.peers.values()) if (!upper.has(ts)) return false;
  const local = tick(lower, -1);
  return upper.has(local);
};

test('`new_con` + `ins_obj`', () => {
  const model = Model.create({});
  const model2 = model.fork();
  model2.api.add('/baz', true);
  const delta = model2.delta(model.clock);
  model.applyDelta(delta);
  model.applyDelta(delta);
  expect(model2.view()).toEqual(model.view());
  expect(covers(model.clock, model2.clock)).toBe(true);
});

test('`new_obj`', () => {
  const model = Model.create();
  const model2 = model.fork();
  model2.api.add('', {});
  const delta = model2.delta(model.clock);
  model.applyDelta(delta);
  model.applyDelta(delta);
  expect(model2.view()).toEqual(model.view());
  expect(covers(model.clock, model2.clock)).toBe(true);
});

test('`new_val` + `new_con` + `ins_val` + `ins_obj`', () => {
  const model = Model.create({});
  const model2 = model.fork();
  model2.api.add('/foo', s.val(s.con(0)));
  const delta = model2.delta(model.clock);
  model.applyDelta(delta);
  model.applyDelta(delta);
  expect(model2.view()).toEqual(model.view());
  expect(covers(model.clock, model2.clock)).toBe(true);
});

test('`new_vec` + `ins_vec` + `new_con`', () => {
  const model = Model.create(s.vec());
  const model2 = model.fork();
  model2.api.add('', s.vec(s.con(0)));
  const delta = model2.delta(model.clock);
  model.applyDelta(delta);
  model.applyDelta(delta);
  expect(model2.view()).toEqual(model.view());
  expect(covers(model.clock, model2.clock)).toBe(true);
});

test('`ins_str` + `del`', () => {
  const model = Model.create('hello world');
  const model2 = model.fork();
  model2.api.merge('', 'Hello, world!');
  const delta = model2.delta(model.clock);
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

  const delta = model.delta(model2.clock);
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
  const delta = model2.delta(model.clock);
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

  const delta = model.delta(model2.clock);
  model2.applyDelta(delta);
  model2.applyDelta(delta);
  model2.applyDelta(delta);
  model2.applyDelta(delta);
  expect(model.view()).toEqual(model2.view());
  expect(covers(model2.clock, model.clock)).toBe(true);
});

test('`ins_arr` + `new_str` + `new_bin` + `new_arr` + `del`', () => {
  const model = Model.create(['a', 'x']);
  const model2 = model.fork();
  model2.api.arr([]).ins(1, ['b', 'c', b(5, 0, 0, 5), []]);
  model2.api.arr([]).del(5, 1);;
  const delta = model2.delta(model.clock);
  model.applyDelta(delta);
  expect(model2.view()).toEqual(model.view());
  expect(covers(model.clock, model2.clock)).toBe(true);
});

test('complex case with many ops', () => {
  const model = Model.create({
    foo: 'bar',
    arr: [1, 2, 3],
    true: false,
    binary: b(1, 2, 3),
  });
  const model2 = model.fork();
  model2.api.merge({
    foo: 'Bar!',
    arr: [1, 4, 3, 5],
    true: true,
    hello: 'world',
    list: [s.con(0), 0, 1],
    vector: s.vec(s.con('b'), s.str('...'), s.con(2)),
    time: ts(123, 456),
    binary: b(2, 3, 4, 5, 6, 8, 9, 10),
    users: [
      {id: 1, name: 'Alice'},
      {id: 2, name: 'Bob'},
    ],
    verified: true,
    tags: [
      'Silk',
      'Road',
      {group: 'A', members: ['Alice', 'Bob']},
      {group: 'B', members: ['Carol', 'Dave']},
    ],
  });
  const delta = model2.delta(model.clock);
  const blob = delta.toBinary();
  const delta2 = Delta.from(blob);
  model.applyDelta(delta2);
  expect(model2.view()).toEqual(model.view());
  expect(covers(model.clock, model2.clock)).toBe(true);
});
