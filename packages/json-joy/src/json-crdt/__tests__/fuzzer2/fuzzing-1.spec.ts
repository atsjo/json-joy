import {Model} from "../../model";
import {FuzzerContext} from "./FuzzerContext";

const Math$$random = Math.random;
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

describe('`str` node fuzzing', () => {
  test('.merge(): "str" deletes of inserts that other peer not aware yet', () => {
    const model = Model.create('');
    const ctx = new FuzzerContext(model, Buffer.from([1, 2, 3, 4]));
    ctx.forkModel();
    ctx.forkModel();
    for (let i = 0; i < 2; i++) {
      ctx.execRandomOpsOnAllModels(1, 5);
      ctx.flushPatches();
      ctx.mergeAllModels();
      ctx.assertAllModelViews();
    }
  });

  test('run seeds', () => {
    for (let seed = 0; seed < 100; seed++) {
      const model = Model.create('');
      const ctx = new FuzzerContext(model, Buffer.from([1, 3, 3, 7, seed, randomInt(0, 255), randomInt(0, 255), randomInt(0, 255)]));
      ctx.forkModel();
      ctx.forkModel();
      ctx.forkModel();
      for (let i = 0; i < 17; i++) {
        ctx.execRandomOpsOnAllModels(1, 5);
        ctx.flushPatches();
        ctx.mergeAllModels();
        ctx.assertAllModelViews();
      }
    }
  });
});

describe('`bin` node fuzzing', () => {
  test('run seeds', () => {
    for (let seed = 0; seed < 25; seed++) {
      const model = Model.create(new Uint8Array());
      const ctx = new FuzzerContext(model, Buffer.from([42, 42, 42, seed, randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255)]));
      ctx.forkModel();
      ctx.forkModel();
      ctx.forkModel();
      for (let i = 0; i < 24; i++) {
        ctx.execRandomOpsOnAllModels(1, 5);
        ctx.flushPatches();
        ctx.mergeAllModels();
        ctx.assertAllModelViews();
      }
    }
  });
});

describe('all nodes - 2 peers', () => {
  test('Seed: Buffer.from([42, 42, 42, 1, 201, 161, 61, 197, 88, 106, 76, 108])', () => {
    for (let seed = 0; seed < 10; seed++) {
      const model = Model.create({});
      const ctx = new FuzzerContext(model, Buffer.from([42, 42, 42, 1, 201, 161, 61, 197, 88, 106, 76, 108]));
      ctx.forkModel();
      ctx.forkModel();
      for (let i = 0; i < 100; i++) {
        ctx.execRandomOpsOnAllModels(1, 5);
        ctx.flushPatches();
        ctx.mergeAllModels();
        ctx.assertAllModelViews();
      }
    }
  });

  test('run seeds', () => {
    for (let seed = 0; seed < 10; seed++) {
      const model = Model.create({});
      const ctx = new FuzzerContext(model, Buffer.from([42, 42, 42, seed, randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255)]));
      ctx.forkModel();
      ctx.forkModel();
      for (let i = 0; i < 100; i++) {
        ctx.execRandomOpsOnAllModels(1, 5);
        ctx.flushPatches();
        ctx.mergeAllModels();
        ctx.assertAllModelViews();
      }
      // ctx.dump();
    }
  });
});

describe('all nodes - 3 peers', () => {
  test('run seeds', () => {
    for (let seed = 0; seed < 10; seed++) {
      const model = Model.create({});
      const ctx = new FuzzerContext(model, Buffer.from([seed, randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255)]));
      ctx.forkModel();
      ctx.forkModel();
      ctx.forkModel();
      for (let i = 0; i < 100; i++) {
        ctx.execRandomOpsOnAllModels(1, 5);
        ctx.flushPatches();
        ctx.mergeAllModels();
        ctx.assertAllModelViews();
      }
      // ctx.dump();
    }
  });
});

describe('all nodes - 4 peers', () => {
  test('run seeds', () => {
    for (let seed = 0; seed < 10; seed++) {
      const model = Model.create({});
      const ctx = new FuzzerContext(model, Buffer.from([seed, randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255)]));
      ctx.forkModel();
      ctx.forkModel();
      ctx.forkModel();
      ctx.forkModel();
      for (let i = 0; i < 100; i++) {
        ctx.execRandomOpsOnAllModels(1, 5);
        ctx.flushPatches();
        ctx.mergeAllModels();
        ctx.assertAllModelViews();
      }
      // ctx.dump();
    }
  });
});
