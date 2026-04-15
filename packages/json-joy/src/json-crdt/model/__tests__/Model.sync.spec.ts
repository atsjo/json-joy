import {Patch} from '../../../json-crdt-patch';
import {ORIGIN} from '../../../json-crdt-patch/constants';
import {ts} from '../../../json-crdt-patch/clock';
import {
  InsArrOp,
  InsObjOp,
  InsValOp,
  NewArrOp,
  NewConOp,
  NewObjOp,
  NewValOp,
} from '../../../json-crdt-patch/operations';
import {Model} from '../Model';

const source0 = 1841463426075560;
const source1 = 3986034759077557;
const source2 = 6440168143735029;

const patch = (...ops: Patch['ops']) => {
  const nextPatch = new Patch();
  nextPatch.ops.push(...ops);
  return nextPatch;
};

const emptyPatch = () => new Patch();

describe('sync replays', () => {
  test('replays sparse concurrent histories without crashing on missing array children', () => {
    const histories = [
      [
        emptyPatch(),
        emptyPatch(),
        patch(
          new NewValOp(ts(source0, 172)),
          new InsObjOp(ts(source0, 175), ts(source2, 153), [['name', ts(source0, 172)]]),
        ),
        emptyPatch(),
        emptyPatch(),
        emptyPatch(),
        patch(
          new NewConOp(ts(source0, 217), undefined),
          new InsValOp(ts(source0, 218), ORIGIN, ts(source0, 217)),
          new NewValOp(ts(source0, 219)),
          new InsArrOp(ts(source0, 222), ts(source2, 180), ts(source1, 202), [ts(source0, 219)]),
        ),
        emptyPatch(),
      ],
      [
        emptyPatch(),
        emptyPatch(),
        emptyPatch(),
        emptyPatch(),
        emptyPatch(),
        emptyPatch(),
        emptyPatch(),
        patch(
          new NewValOp(ts(source1, 230)),
          new InsArrOp(ts(source1, 233), ts(source2, 180), ts(source2, 180), [ts(source1, 230)]),
        ),
      ],
      [
        patch(new NewObjOp(ts(source2, 153)), new InsValOp(ts(source2, 154), ORIGIN, ts(source2, 153))),
        emptyPatch(),
        emptyPatch(),
        patch(new NewArrOp(ts(source2, 180)), new InsValOp(ts(source2, 181), ts(source0, 172), ts(source2, 180))),
        emptyPatch(),
        emptyPatch(),
        patch(new NewConOp(ts(source2, 217), 123), new InsValOp(ts(source2, 218), ts(source0, 172), ts(source2, 217))),
        emptyPatch(),
      ],
    ];

    const base = Model.create('');
    const models = [base.fork(source0), base.fork(source1), base.fork(source2)];
    const steps = Math.max(...histories.map((history) => history.length));

    for (let step = 0; step < steps; step++) {
      for (let source = 0; source < models.length; source++) {
        models[source].applyBatch([histories[source][step]]);
      }
      for (const model of models) {
        for (const history of histories) model.applyBatch(history.slice(0, step + 1));
      }
    }

    expect(models.map((model) => model.view())).toEqual([undefined, undefined, undefined]);
  });
});
