import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import type {Model} from '../../model';
import {FuzzerModel} from './FuzzerModel';
import {type Patch, s} from '../../../json-crdt-patch';

export class FuzzerContext extends Fuzzer {
  public readonly models: FuzzerModel[] = [];
  public readonly patches: Patch[][] = [];

  constructor(
    public readonly start: Model<any>,
    seed?: Buffer,
  ) {
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

  randomUint8Array(length: number) {
    const arr = new Uint8Array(length);
    for (let i = 0; i < length; i++) arr[i] = this.randomInt(0, 255);
    return arr;
  }

  public keyList = ['a', 'b', 'id', 'test', 'name', '', '__proto__'];

  randomKey(): string {
    return this.pick(this.keyList);
  }

  public valueList = [void 0, null, 123, 'str', {}, [], s.val(s.con(1))];

  randomValue(): unknown {
    return this.pick(this.valueList);
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

  syncByOps() {
    const {models} = this;
    const length = models.length;
    for (let i = 0; i < length; i++) {
      const model = models[i].model;
      for (let j = 0; j < length; j++) model.applyBatch(this.patches[j]);
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
        this.dump();
        throw error;
      }
    }
  }

  dump() {
    console.log('Seed:', `Buffer.from([${this.seed.join(', ')}])`);
    const {models} = this;
    const length = models.length;
    for (let i = 0; i < length; i++) {
      const m = models[i].model;
      console.log(`Model ${i}`);
      console.log(m + '');
      for (const patch of this.patches[i]) {
        console.log(patch + '');
      }
    }
  }
}
