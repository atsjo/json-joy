import {Fuzzer} from "@jsonjoy.com/util/lib/Fuzzer";
import {Model} from "../../model";
import {FuzzerModel} from "./FuzzerModel";
import {Patch} from "../../../json-crdt-patch";

export class FuzzerContext extends Fuzzer {
  public readonly models: FuzzerModel[] = [];
  public readonly patches: Patch[][] = [];

  constructor(public readonly start: Model<any>, seed?: Buffer) {
    super(seed);
  }

  randomStr(length: number) {
    let str = '';
    for (let i = 0; i < length; i++) {
      const charCode = Math.floor(this.random() * (126 - 32 + 1)) + 32;
      str += String.fromCharCode(charCode);
    }
    return str;
  }

  forkModel(): FuzzerModel {
    const fuzzerModel = new FuzzerModel(this, this.start.fork());
    this.models.push(fuzzerModel);
    this.patches.push([]);
    return fuzzerModel;
  }

  execRandomOpOnAllModels() {
    for (const model of this.models) model.execRandomOp();
  }

  execRandomOpsOnAllModels(minOps: number, maxOps: number) {
    for (const model of this.models) {
      const count = this.randomInt(minOps, maxOps);
      for (let i = 0; i < count; i++) model.execRandomOp();
    }
  }

  flushPatches() {
    for (let i = 0; i < this.models.length; i++) {
      const model = this.models[i].model;
      const patch = model.api.builder.flush();
      this.patches[i].push(patch);
    }
  }

  mergeAllModels() {
    const {models} = this;
    const length = models.length;
    for (let i = 0; i < length; i++) {
      for (let j = i + 1; j < length; j++) {
        const model1 = models[i].model;
        const model2 = models[j].model;
        model1.merge(model2);
        model2.merge(model1);
      }
    }
  }

  assertAllModelViews() {
    const {models} = this;
    const length = models.length;
    const view = models[0].model.view();
    for (let i = 1; i < length; i++) {
      const otherView = models[i].model.view();
      try {
        expect(otherView).toEqual(view);
      } catch (error) {
        for (let i = 0; i < length; i++) {
          const m = models[i].model;
          console.log(`Model ${i}`);
          console.log(m + '');
          for (const patch of this.patches[i]) {
            console.log(patch + '');
          }
        }
        throw error;
      }
    }
  }
}
