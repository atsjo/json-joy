import {Model, NodeApi, StrApi} from "../../model";
import {FuzzerContext} from "./FuzzerContext";

export class FuzzerModel {
  constructor (
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
        if (ctx.random() < .25) { // delete
          const pos = ctx.randomInt(0, length - 2);
          const len = ctx.randomInt(1, length - pos);
          node.del(pos, len);
        } else { // insert
          const str = ctx.randomStr(ctx.randomInt(1, 10));
          const pos = ctx.randomInt(0, length);
          node.ins(pos, str);
        }
      }
    }
  }
}
