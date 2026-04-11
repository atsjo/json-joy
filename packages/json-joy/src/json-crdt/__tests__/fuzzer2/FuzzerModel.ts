import {ArrApi, BinApi, type Model, type NodeApi, ObjApi, StrApi, ValApi, VecApi} from '../../model';
import type {FuzzerContext} from './FuzzerContext';

export class FuzzerModel {
  constructor(
    public readonly ctx: FuzzerContext,
    public readonly model: Model<any>,
  ) {}

  pickNode(): NodeApi<any> {
    const {ctx, model} = this;
    const nodes = [...model.index.entries()];
    const length = nodes.length;
    if (!length) return model.api.wrap(model.root);
    if (ctx.random() < 0.01) return model.api.wrap(model.root);
    const index = ctx.randomInt(0, length - 1);
    return model.api.wrap(nodes[index]?.v ?? model.root);
  }

  execRandomOp(): void {
    const node = this.pickNode();
    this.execRandomOpForNode(node);
  }

  execRandomOpForNode(node: NodeApi<any>): void {
    const {ctx} = this;
    if (node instanceof StrApi) {
      const length = node.length();
      if (!length) {
        node.ins(0, ctx.randomStr(ctx.randomInt(1, 10)));
      } else {
        if (ctx.random() < 0.25) {
          // delete
          const pos = ctx.randomInt(0, length - 2);
          const len = ctx.randomInt(1, length - pos);
          node.del(pos, len);
        } else {
          // insert
          const str = ctx.randomStr(ctx.randomInt(1, 10));
          const pos = ctx.randomInt(0, length);
          node.ins(pos, str);
        }
      }
    } else if (node instanceof BinApi) {
      const length = node.length();
      if (!length) {
        node.ins(0, ctx.randomUint8Array(ctx.randomInt(1, 10)));
      } else {
        if (ctx.random() < 0.25) {
          // delete
          const pos = ctx.randomInt(0, length - 2);
          const len = ctx.randomInt(1, length - pos);
          node.del(pos, len);
        } else {
          // insert
          const str = ctx.randomUint8Array(ctx.randomInt(1, 10));
          const pos = ctx.randomInt(0, length);
          node.ins(pos, str);
        }
      }
    } else if (node instanceof ArrApi) {
      const length = node.length();
      if (!length) {
        node.ins(0, [ctx.randomValue()]);
      } else {
        if (ctx.random() < 0.25) {
          // delete
          const pos = ctx.randomInt(0, length - 2);
          const len = ctx.randomInt(1, length - pos);
          node.del(pos, len);
        } else {
          // insert
          const value = ctx.randomValue();
          const pos = ctx.randomInt(0, length);
          node.ins(pos, [value]);
        }
      }
    } else if (node instanceof ObjApi) {
      const keys = Object.keys(node.view() as Record<string, unknown>);
      const doInsert = !keys.length || ctx.random() < 0.75;
      if (doInsert) {
        const key = ctx.randomKey();
        const value = ctx.randomValue();
        node.set({[key]: value});
      } else {
        const key = ctx.pick(keys);
        node.del([key]);
      }
    } else if (node instanceof VecApi) {
      const length = node.length();
      const doInsert = !length || ctx.random() < 0.75;
      if (doInsert) {
        const value = ctx.randomValue();
        node.set([[length, value]]);
      } else {
        const key = ctx.randomInt(0, length - 1);
        node.set([[key, void 0]]); // delete
      }
    } else if (node instanceof ValApi) {
      node.set(ctx.randomValue());
    }
  }
}
