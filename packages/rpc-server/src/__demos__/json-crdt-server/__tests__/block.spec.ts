import {setupMemory, setupLevelMemory, setupLevelClassic} from './setup';
import {runBlockTests} from '../../../__tests__/json-crdt-server/block';
import type {ApiTestSetup} from './setup';

describe('MemoryStore', () => {
  runBlockTests(setupMemory as ApiTestSetup);
});

describe('LevelStore(memory-level)', () => {
  runBlockTests(setupLevelMemory as ApiTestSetup);
});

describe('LevelStore(classic-level)', () => {
  runBlockTests(setupLevelClassic as ApiTestSetup);
});
