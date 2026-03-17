import {ObjApi} from 'json-joy/lib/json-crdt/model';
import {EditableFmt} from './base';
import type {Slice} from 'json-joy/lib/json-crdt-extensions';
import type {ObjNode} from 'json-joy/lib/json-crdt/nodes';

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
