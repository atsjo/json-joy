import {b} from '@jsonjoy.com/buffers/src/b';
import {Delta} from '../../delta/Delta';
import {Model} from '../Model';

describe('.delta()', () => {
  test('can compute delta between model states', () => {
    const model1 = Model.create();
    model1.api.set({
      foo: 'bar',
      qux: [1, 2, 3],
    });
    const model2 = model1.fork();
    model1.api.add('/z', 'x');
    model2.api.merge({
      foo: 'baz',
      qux: [1, 2, 3, 4],
    });
    const delta1 = model2.delta(model1.clock);
    const delta2 = model1.delta(model2.clock);
    model1.applyDelta(delta1);
    model2.applyDelta(delta2);
    expect(model1.view()).toEqual(model2.view());
  });

  test('can serialize and deserialize delta', () => {
    const model1 = Model.create();
    model1.api.set({
      foo: 'bar',
      qux: [1, 2, 3],
    });
    const model2 = model1.fork();
    model1.api.add('/z', 'x');
    model2.api.merge({
      foo: 'baz',
      qux: [1, 2, 3, 4],
    });
    const delta1 = Delta.from(model2.delta(model1.clock).toBinary());
    const delta2 = Delta.from(model1.delta(model2.clock).toBinary());
    model1.applyDelta(delta1);
    model2.applyDelta(delta2);
    expect(model1.view()).toEqual(model2.view());
  });
});

describe('.merge()', () => {
  test('can compute delta between model states', () => {
    const model1 = Model.create();
    model1.api.set({
      foo: '',
      qux: [],
    });
    const model2 = model1.fork();
    model1.api.add('/z', 'x');
    model2.api.merge({
      foo: 'baz',
      qux: [1, 2, 3, 4],
    });
    model1.merge(model2);
    expect(model1.view()).not.toEqual(model2.view());
    model2.merge(model1);
    expect(model1.view()).toEqual(model2.view());
  });

  test('three users edit a "str" independently', () => {
    const model = Model.create('12345');
    const u1 = model.fork();
    const u2 = model.fork();
    const u3 = model.fork();
    u1.api.str().del(1, 1);
    u1.api.str().ins(1, 'abc');
    u1.api.str().del(1, 2);
    u1.api.str().ins(0, 'xy');
    u1.api.str().del(1, 1);
    u2.api.str().del(2, 2);
    u2.api.str().ins(3, 'ab');
    u2.api.str().del(4, 1);
    u2.api.str().ins(0, 'xy');
    u2.api.str().del(0, 1);
    u3.api.str().del(3, 2);
    u3.api.str().ins(1, '!@#');
    u3.api.str().del(2, 1);
    u3.merge(u2);
    u1.merge(u3);
    model.merge(u1);
    u1.merge(model);
    u2.merge(model);
    u3.merge(model);
    const view = model.view();
    expect(view).toBe(u1.view());
    expect(view).toBe(u2.view());
    expect(view).toBe(u3.view());
    expect(view).toContain('x');
    expect(view).toContain('y');
    expect(view).toContain('!');
    expect(view).toContain('#');
    expect(view).toContain('a');
  });

  test('three users edit a "bin" independently', () => {
    const model = Model.create(b(1, 2, 3, 4, 5));
    const u1 = model.fork();
    const u2 = model.fork();
    const u3 = model.fork();
    u1.api.bin().del(1, 1);
    u1.api.bin().ins(1, b(0x61, 0x62, 0x63)); // 'abc'
    u1.api.bin().del(1, 2);
    u1.api.bin().ins(0, b(0x78, 0x79)); // 'xy'
    u1.api.bin().del(1, 1);
    u2.api.bin().del(2, 2);
    u2.api.bin().ins(3, b(0x61, 0x62)); // 'ab'
    u2.api.bin().del(4, 1);
    u2.api.bin().ins(0, b(0x78, 0x79)); // 'xy'
    u2.api.bin().del(0, 1);
    u3.api.bin().del(3, 2);
    u3.api.bin().ins(1, b(0x21, 0x40, 0x23)); // '!@#'
    u3.api.bin().del(2, 1);
    u3.merge(u2);
    u1.merge(u3);
    model.merge(u1);
    u1.merge(model);
    u2.merge(model);
    u3.merge(model);
    const view = model.view();
    expect(view).toEqual(u1.view());
    expect(view).toEqual(u2.view());
    expect(view).toEqual(u3.view());
  });

  test('three users edit a "arr" independently', () => {
    const model = Model.create([1, 2, 3, 4, 5]);
    const u1 = model.fork();
    const u2 = model.fork();
    const u3 = model.fork();
    u1.api.arr().del(1, 1);
    u1.api.arr().ins(1, [0x61, 0x62, 0x63]); // 'abc'
    u1.api.arr().del(1, 2);
    u1.api.arr().ins(0, [0x78, 0x79]); // 'xy'
    u1.api.arr().del(1, 1);
    u2.api.arr().del(2, 2);
    u2.api.arr().ins(3, [0x61, 0x62]); // 'ab'
    u2.api.arr().del(4, 1);
    u2.api.arr().ins(0, [0x78, 0x79]); // 'xy'
    u2.api.arr().del(0, 1);
    u3.api.arr().del(3, 2);
    u3.api.arr().ins(1, [0x21, 0x40, 0x23]); // '!@#'
    u3.api.arr().del(2, 1);
    u3.merge(u2);
    u1.merge(u3);
    model.merge(u1);
    u1.merge(model);
    u2.merge(model);
    u3.merge(model);
    const view = model.view();
    expect(view).toEqual(u1.view());
    expect(view).toEqual(u2.view());
    expect(view).toEqual(u3.view());
  });
});
