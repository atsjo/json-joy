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
    const delta1 = Delta.from(model2.delta(model1.clock).toU8());
    const delta2 = Delta.from(model1.delta(model2.clock).toU8());
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
});
