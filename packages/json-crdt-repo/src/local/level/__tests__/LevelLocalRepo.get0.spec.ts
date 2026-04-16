import {BehaviorSubject} from 'rxjs';
import {Model} from 'json-joy/lib/json-crdt';
import {setup} from './setup';

describe('.get0()', () => {
  test('returns local model, frontier, and metadata for debugging', async () => {
    const kit = await setup({local: {connected$: new BehaviorSubject(false)}});
    const model = Model.create(undefined, kit.sid);
    model.api.root({foo: 'bar'});
    const patch = model.api.flush();

    await kit.local.sync({
      id: kit.blockId,
      patches: [patch],
    });

    const get0 = await kit.local.get0?.(kit.blockId);
    expect(get0).toBeDefined();
    expect(get0?.model.view()).toEqual({foo: 'bar'});
    expect(get0?.frontier).toHaveLength(1);
    expect(get0?.frontier[0].toBinary()).toEqual(patch.toBinary());
    expect(get0?.meta).toMatchObject({
      seq: -1,
      time: 0,
    });

    await kit.stop();
  });
});
