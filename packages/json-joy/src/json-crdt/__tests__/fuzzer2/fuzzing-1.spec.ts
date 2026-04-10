import {Model} from "../../model";
import {FuzzerContext} from "./FuzzerContext";

test('basic string .merge() fuzzing', () => {
  const model = Model.create('');
  const ctx = new FuzzerContext(model, Buffer.from([1, 2, 3, 4]));
  const model1 = ctx.forkModel();
  const model2 = ctx.forkModel();

  for (let i = 0; i < 2; i++) {
    ctx.execRandomOpsOnAllModels(1, 5);
    ctx.flushPatches();
    ctx.mergeAllModels();
    ctx.assertAllModelViews();
  }

  console.log(model1.model + '');
  console.log(model2.model + '');
});
