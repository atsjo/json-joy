import {setupMemory, setupLevelMemory, setupLevelClassic} from './setup';
import {runBlockTests} from './server/block';
import type {ApiTestSetup} from './types';

describe('MemoryStore', () => {
  runBlockTests(setupMemory as ApiTestSetup);
});

describe('LevelStore(memory-level)', () => {
  runBlockTests(setupLevelMemory as ApiTestSetup);
});

describe('LevelStore(classic-level)', () => {
  runBlockTests(setupLevelClassic as ApiTestSetup);
});
