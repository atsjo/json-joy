import {s} from 'json-joy/lib/json-crdt-patch';
import {Model, type ObjApi} from 'json-joy/lib/json-crdt/model';
import {EditableFmt} from './base';
import type {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';
import type {InlineSliceBehavior} from '../../inline/InlineSliceBehavior';
import type {ObjNode} from 'json-joy/lib/json-crdt/nodes';
import type {EditorState} from '../EditorState';

/**
 * New formatting which is being created. Once created, it will be promoted to
 * a {@link SavedFmt} instance.
 */
export class NewFmt<Node extends ObjNode = ObjNode> extends EditableFmt<Range<string>, Node> {
  public readonly model: Model<ObjNode<{conf: any}>>;

  constructor(
    public readonly behavior: InlineSliceBehavior<any, any, any>,
    public readonly range: Range<string>,
    public readonly state: EditorState,
  ) {
    super(behavior, range, state);
    const schema = s.obj({conf: behavior.schema || s.con(void 0)});
    this.model = Model.create(schema);
  }

  public conf(): ObjApi<Node> | undefined {
    return this.model.api.obj(['conf']) as unknown as ObjApi<Node>;
  }

  public readonly save = () => {
    const state = this.state;
    state.newSlice.next(void 0);
    const view = this.conf()?.view() as Record<string, unknown>;
    if (!view || typeof view !== 'object') return;
    if (!view.title) delete view.title;
    const et = state.surface.events.et;
    et.format('tog', this.behavior.tag, 'many', view);
    et.cursor({move: [['focus', 'char', 0, true]]});
  };
}
