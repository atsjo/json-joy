import {Draft} from '../Draft';
import {encode} from '../codec/json/encode';
import {LogicalClock} from '../clock';

test('can create a draft patch', () => {
  const draft = new Draft();
  const id = draft.builder.json({
    a: [1, true, null, {}, []]
  });
  draft.builder.root(id);
  expect(encode(draft.builder.patch)).toEqual({
    id: [ -1, 0 ],
    ops: [
      { op: 'obj' },
      { op: 'arr' },
      { op: 'num' },
      { op: 'num_set', after: [-1, 2], value: 1 },
      { op: 'obj' },
      { op: 'arr' },
      { op: 'arr_ins', obj: [-1, 5], after: [-1, 5], values: [] },
      { op: 'arr_ins', obj: [-1, 1], after: [-1, 1], values: [
        [-1, 2],
        [0, 2],
        [0, 1],
        [-1, 4],
        [-1, 5]
      ] },
      { op: 'obj_set', obj: [-1, 0], tuples: [['a', [-1, 1]]] },
      { op: 'root', value: [-1, 0] }
    ]
  });
});

test('can return final patch with correct timestamps', () => {
  const draft = new Draft();
  const id = draft.builder.json({
    a: [1, true, null, {}, []]
  });
  draft.builder.root(id);
  const patch = draft.patch(new LogicalClock(100, 200));
  expect(encode(patch)).toEqual({
    id: [ 100, 200 ],
    ops: [
      { op: 'obj' },
      { op: 'arr' },
      { op: 'num' },
      { op: 'num_set', after: [100, 202], value: 1 },
      { op: 'obj' },
      { op: 'arr' },
      { op: 'arr_ins', obj: [100, 205], after: [100, 205], values: [] },
      { op: 'arr_ins', obj: [100, 201], after: [100, 201], values: [
        [100, 202],
        [0, 2],
        [0, 1],
        [100, 204],
        [100, 205]
      ] },
      { op: 'obj_set', obj: [100, 200], tuples: [['a', [100, 201]]] },
      { op: 'root', value: [100, 200] }
    ]
  });
});
