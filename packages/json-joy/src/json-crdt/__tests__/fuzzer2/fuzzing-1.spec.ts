import {Model} from "../../model";
import {FuzzerContext} from "./FuzzerContext";

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
