import {s} from 'json-joy/lib/json-crdt';
import {SavedFmt} from '.';
import {Model, ObjApi} from 'json-joy/lib/json-crdt/model';
import type {ObjNode} from 'json-joy/lib/json-crdt/nodes';

export class SynthFmt<Node extends ObjNode = ObjNode> extends SavedFmt<Node> {
  private readonly _conf!: ObjApi<Node>;
  
  constructor(public readonly saved: SavedFmt<Node>) {
    super(saved.behavior, saved.range, saved.state);
    const sourceModel = saved.range.txt.model;
    const clone = sourceModel.clone();
    const confId = saved.conf()?.node.id;
    if (!confId) return;
    const node = clone.index.get(confId) as ObjNode | undefined;
    if (node) {
      const nodeApi = clone.api.wrap(node);
      if (nodeApi instanceof ObjApi) this._conf = nodeApi as unknown as ObjApi<Node>;
    }
    if (!this._conf) {
      const shadowModel = Model.create(saved.behavior.schema || s.obj({}));
      this._conf = shadowModel.api.obj([]) as unknown as ObjApi<Node>;
    }
  }

  public conf(): ObjApi<Node> | undefined {
    return this._conf;
  }
}
