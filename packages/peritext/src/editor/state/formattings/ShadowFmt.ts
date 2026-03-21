import {Model, type ObjApi} from 'json-joy/lib/json-crdt/model';
import {toSchema} from 'json-joy/lib/json-crdt/schema/toSchema';
import {SavedFmt} from './SavedFmt';
import type {ObjNode} from 'json-joy/lib/json-crdt/nodes';

export class ShadowFmt<Node extends ObjNode = ObjNode> extends SavedFmt<Node> {
  protected _model: Model<any>;

  constructor(public readonly saved: SavedFmt<Node>) {
    super(saved.behavior, saved.range, saved.state);
    const nodeApi = saved.conf();
    const schema = nodeApi ? toSchema(nodeApi.node) : saved.behavior.schema;
    this._model = Model.create(schema as any);
  }

  public conf(): ObjApi<Node> | undefined {
    return this._model.api.obj([]) as unknown as ObjApi<Node>;
  }
}
