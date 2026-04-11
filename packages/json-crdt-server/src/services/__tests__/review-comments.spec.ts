/**
 * Tests that reproduce bugs identified during PR #1015 review.
 */

import {tick} from 'thingies';
import {MemoryLevel} from 'memory-level';
import {LevelStore} from '../blocks/store/level/LevelStore';
import {Services, type ServicesOpts} from '../Services';
import {Model} from 'json-joy/lib/json-crdt';

let cnt = 0;

const setupMemoryLevel = async (opts?: Omit<ServicesOpts, 'store'>) => {
  const kv = new MemoryLevel<string, Uint8Array>({
    keyEncoding: 'utf8',
    valueEncoding: 'view',
  });
  const store = new LevelStore(<any>kv);
  const services = new Services({...opts, store});
  const genId = () => 'id-' + Math.random().toString(36).slice(2) + '-' + Date.now() + '-' + cnt++;
  return {services, store, kv, genId};
};

describe('LevelStore.seq() missing gte bound', () => {
  test('seq() should not return batch keys from another block when ID contains delimiter', async () => {
    const kit = await setupMemoryLevel();

    // Create a block whose batch keys look like: b!abc!b!000000
    const id1 = 'abc';
    const model1 = Model.create();
    model1.api.root({block: 1});
    await kit.services.blocks.create(id1, 0, {patches: [{blob: model1.api.flush().toBinary()}]});

    // Now create a block with ID 'abc!b' (contains the ! delimiter).
    // Its batchBase would be 'b!abc!b!b!' which overlaps with id1's batch key prefix 'b!abc!b!'.
    // Without gte bound, seq('abc!b') would scan backwards from 'b!abc!b!b!~'
    // and find 'b!abc!b!000000' from id1, incorrectly returning 0 instead of undefined.
    const id2 = 'abc!b';
    const model2 = Model.create();
    model2.api.root(undefined);
    await kit.services.blocks.create(id2, 0);

    // seq() for id2 should be undefined (no batches), not pick up id1's batch
    const seq2 = await kit.store.seq(id2);
    expect(seq2).toBe(undefined);
  });
});

describe('LevelStore.removeAccessedBefore()', () => {
  test('should remove blocks accessed BEFORE the given timestamp, not after', async () => {
    const kit = await setupMemoryLevel();
    const oldId = kit.genId();
    const newId = kit.genId();

    // Create an "old" block
    const model1 = Model.create();
    model1.api.root({old: true});
    await kit.services.blocks.create(oldId, 0, {patches: [{blob: model1.api.flush().toBinary()}]});

    // Wait a bit so timestamps differ
    await tick(50);
    const cutoff = Date.now();
    await tick(50);

    // Create a "new" block
    const model2 = Model.create();
    model2.api.root({new: true});
    await kit.services.blocks.create(newId, 0, {patches: [{blob: model2.api.flush().toBinary()}]});

    // removeAccessedBefore(cutoff) should remove oldId (accessed before cutoff) and keep newId
    await kit.store.removeAccessedBefore(cutoff, 10);

    // Wait for async remove to complete (remove is fire-and-forget in removeAccessedBefore)
    await tick(500);

    const oldExists = await kit.store.exists(oldId);
    const newExists = await kit.store.exists(newId);

    expect(oldExists).toBe(false); // Should be removed (accessed before cutoff)
    expect(newExists).toBe(true); // Should still exist (accessed after cutoff)
  });
});

describe('BlocksServices.scan() with limit=0', () => {
  test('should not throw when limit is 0', async () => {
    const kit = await setupMemoryLevel();
    const id = kit.genId();

    const model = Model.create();
    model.api.root({foo: 'bar'});
    await kit.services.blocks.create(id, 0, {patches: [{blob: model.api.flush().toBinary()}]});

    // Scanning with limit=0 should return empty batches, not throw
    const result = await kit.services.blocks.scan(id, false, 0, 0);
    expect(result.batches).toEqual([]);
  });
});

describe('RpcError import consistency', () => {
  test('errors thrown by store/services should be instanceof the same RpcError used in routes', async () => {
    // If the imports are different packages, instanceof checks fail
    const {RpcError} = await import('@jsonjoy.com/rpc-error');
    const kit = await setupMemoryLevel();

    try {
      // get on non-existent block should throw RpcError.notFound() via BlocksServices
      await kit.services.blocks.get('non-existent-id');
      throw new Error('should not reach here');
    } catch (err: any) {
      // The error should be an instance of the @jsonjoy.com/rpc-error RpcError
      expect(err).toBeInstanceOf(RpcError);
    }
  });
});
