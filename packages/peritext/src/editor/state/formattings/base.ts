import type {ObjApi} from 'json-joy/lib/json-crdt/model';
import {Value} from 'thingies/lib/sync';
import type {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';
import type {SpanBehavior, ValidationResult} from '../../inline/SpanBehavior';
import type {ObjNode} from 'json-joy/lib/json-crdt/nodes';
import type {EditorState} from '../EditorState';

export interface FmtBase<B extends SpanBehavior<any, any, any>, R extends Range<string>> {
  behavior: B;
  range: R;
}

/** Formatting is a single instance of a (Slice + Behavior) applied to a range of text. */
export interface Fmt<R extends Range<string> = Range<string>, Node extends ObjNode = ObjNode>
  extends FmtBase<SpanBehavior<any, any, any>, R> {
  conf(): ObjApi<Node> | undefined;
}

export abstract class EditableFmt<R extends Range<string> = Range<string>, Node extends ObjNode = ObjNode>
  implements Fmt<R, Node>
{
  public readonly str: Value<string>;

  public constructor(
    public readonly behavior: SpanBehavior<any, any, any>,
    public readonly range: R,
    public readonly state: EditorState,
  ) {
    this.str = new Value(range.text());
  }

  public conf(): ObjApi<Node> | undefined {
    return;
  }

  public validate(): ValidationResult {
    return this.behavior.validate?.(this) ?? 'fine';
  }
}
