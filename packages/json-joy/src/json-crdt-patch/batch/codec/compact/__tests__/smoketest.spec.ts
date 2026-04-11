import {ts} from '../../../../clock';
import {InsStrOp, NewConOp, NewStrOp} from '../../../../operations';
import {Batch} from '../../../Batch';
import {assertRoundtrip} from './assertRoundtrip';

test('empty patch', () => {
  assertRoundtrip([]);
});

test('empty batch', () => {
  assertRoundtrip(void 0, void 0, new Batch([]));
});

test('batch metadata', () => {
  const batch = new Batch([]);
  batch.meta = {foo: 'bar'};
  assertRoundtrip(void 0, void 0, batch);
});

test('', () => {
  assertRoundtrip(void 0, void 0, new Batch([]));
});

test('`new_con`', () => {
  const op = new NewConOp(ts(1, 1), 42);
  assertRoundtrip([op]);
});

test('`new_str` + `ins_str`', () => {
  const op1 = new NewStrOp(ts(4, 5));
  const op2 = new InsStrOp(ts(4, 6), ts(6, 7), ts(8, 9), 'Hello, world!');
  assertRoundtrip([op1, op2]);
});
