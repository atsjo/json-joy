import {ObjApi} from 'json-joy/lib/json-crdt/model';
import type {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';
import type {InlineSliceBehavior, ValidationResult} from '../../inline/InlineSliceBehavior';
import type {ObjNode} from 'json-joy/lib/json-crdt/nodes';
import type {EditorState} from '../EditorState';

export interface FmtBase<B extends InlineSliceBehavior<any, any, any>, R extends Range<string>> {
  behavior: B;
  range: R;
}

/** Formatting is a single instance of a (Slice + Behavior) applied to a range of text. */
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
