import {ITimestampStruct, s} from 'json-joy/lib/json-crdt-patch';
import {Model, ObjApi} from 'json-joy/lib/json-crdt/model';
import {toSchema} from 'json-joy/lib/json-crdt/schema/toSchema';
import {ValueSyncStore} from 'json-joy/lib/util/events/sync-store';
import type {Slice} from 'json-joy/lib/json-crdt-extensions';
import type {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';
import type {InlineSliceBehavior, ValidationResult} from '../inline/InlineSliceBehavior';
import type {ObjNode} from 'json-joy/lib/json-crdt/nodes';
import type {EditorState} from '.';

export interface FmtBase<B extends InlineSliceBehavior<any, any, any>, R extends Range<string>> {
  behavior: B;
  range: R;
}

export interface Fmt<R extends Range<string> = Range<string>, Node extends ObjNode = ObjNode>
  extends FmtBase<InlineSliceBehavior<any, any, any>, R> {
  conf(): ObjApi<Node> | undefined;
}

export abstract class EditableFmt<R extends Range<string> = Range<string>, Node extends ObjNode = ObjNode>
  implements Fmt<R, Node>
{
  public constructor(
    public readonly behavior: InlineSliceBehavior<any, any, any>,
    public readonly range: R,
    public readonly state: EditorState,
  ) {}

  public conf(): ObjApi<Node> | undefined {
    return;
  }

  public validate(): ValidationResult {
    return this.behavior.validate?.(this) ?? 'fine';
  }
}

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

/**
 * Formatting is a specific application of known formatting option to a range of
 * text. Formatting is composed of a specific {@link Slice} which stores the
 * state (location, data) of the formatting and a {@link EditorInlineSliceBehavior}
 * which defines the formatting behavior.
 */
export class SavedFmt<Node extends ObjNode = ObjNode> extends EditableFmt<Slice<string>, Node> {
  /**
   * @returns Unique key for this formatting. This is the hash of the slice.
   *     This is used to identify the formatting in the UI.
   */
  public key(): number {
    return this.range.hash;
  }

  public conf(): ObjApi<Node> | undefined {
    const node = this.range.dataNode();
    return node instanceof ObjApi ? node : undefined;
  }
}

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
