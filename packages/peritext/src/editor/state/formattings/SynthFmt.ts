import {ITimestampStruct} from 'json-joy/lib/json-crdt-patch';
import {Model, ObjApi} from 'json-joy/lib/json-crdt/model';
import {ValueSyncStore} from 'json-joy/lib/util/events/sync-store';
import type {SavedFmt} from '.';
import type {ObjNode} from 'json-joy/lib/json-crdt/nodes';

export class SynthFmt<Node extends ObjNode = ObjNode> {
  public readonly confId: ITimestampStruct | undefined;
  public readonly model: Model<any>;
  public readonly str: ValueSyncStore<string>;
  
  constructor(public readonly saved: SavedFmt<Node>) {
    const sourceModel = saved.range.txt.model;
    this.str = new ValueSyncStore(saved.range.text());
    this.model = sourceModel.clone();
    this.confId = saved.conf()?.node.id;
  }

  public conf(): ObjApi<ObjNode> | undefined {
    const {confId, model} = this;
    if (!confId) return;
    const node = model.index.get(confId) as ObjNode | undefined;
    if (!node) return;
    return model.api.wrap(node);
  }
}
