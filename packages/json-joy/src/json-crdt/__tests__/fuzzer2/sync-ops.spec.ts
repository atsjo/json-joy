import {Model} from '../../model';
import {FuzzerContext} from './FuzzerContext';

const Math$$random = Math.random;
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math$$random() * (max - min + 1)) + min;
};

describe('`str` node fuzzing', () => {
  test('run seeds', () => {
    for (let seed = 0; seed < 42; seed++) {
      const model = Model.create('');
      const ctx = new FuzzerContext(
        model,
        Buffer.from([
          seed,
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
        ]),
      );
      ctx.forkModel();
      ctx.forkModel();
      ctx.forkModel();
      for (let i = 0; i < 24; i++) {
        ctx.execRandomOpsOnAllModels(1, 5);
        ctx.flushPatches();
        ctx.syncByOps();
        ctx.assertAllModelViews();
      }
    }
  });
});

describe('all node node fuzzing', () => {
  test('run seeds', () => {
    for (let seed = 0; seed < 42; seed++) {
      const model = Model.create({});
      const ctx = new FuzzerContext(
        model,
        Buffer.from([
          randomInt(0, 255),
          seed,
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
        ]),
      );
      ctx.forkModel();
      ctx.forkModel();
      ctx.forkModel();
      for (let i = 0; i < 24; i++) {
        ctx.execRandomOpsOnAllModels(1, 5);
        ctx.flushPatches();
        ctx.syncByOps();
        ctx.assertAllModelViews();
      }
    }
  });
});
