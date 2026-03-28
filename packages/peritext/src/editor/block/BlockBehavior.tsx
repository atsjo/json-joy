import * as React from 'react';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {formatKeys, remap} from '../util/keys';
import {
  SliceBehavior,
  type SliceStacking,
  type TypeTag,
} from 'json-joy/lib/json-crdt-extensions';
import type {NodeBuilder} from 'json-joy/lib/json-crdt-patch';
import type {MenuItem} from '../types';
import type {EditorState} from '../state';

/**
 * @todo Behavior on block split (Enter) - ability to add newline in codeblock, but also exit block on double Enter or Cmd+Enter
 * @todo Maybe `Enter` vs `Cmd+Enter` behavior can be inverted/specified per block type.
 * @todo Whether the node is *terminal/leaf* (e.g. code block) or *container* - can contain other blocks (e.g. list item)
 * @todo Whether the typically accepts inline formatting (e.g. code block doesn't, paragraph does)
 * @todo Atomic behavior - e.g. for <math> blocks, where the content is not editable main editor and the block itself is selected as a whole, like an image.
 * @todo Or render the "atomic" block differently depending on whether the cursor is inside it or not.
 * @todo Aliases for block tags: e.g. the `0` `SliceTypeCon.p` could have `'p'` and `'paragraph'` aliases. Good for AI.
 */
export class BlockBehavior<
  Tag extends TypeTag = TypeTag,
  Schema extends NodeBuilder = NodeBuilder,
> extends SliceBehavior<SliceStacking.Marker, Tag, Schema> {
  /** Keys that have to be pressed together to trigger `action` of this behavior. */
  keys?: string[] = void 0;

  /**
   * Defines how this formatting should be displayed in the toolbar and context
   * menus.
   */
  menu?: MenuItem | ((state: EditorState) => MenuItem) = void 0;

  /**
   * Menu group which this formatting belongs to.
   */
  menuId?: string = void 0;
  
  /** Default action to be performed when the keys are pressed or selected in the menu. */
  action?: (state: EditorState) => void = void 0;

  setLeafTag(state: EditorState): void {
    // TODO: What about data, update that, too? Or reset it?
    state.et.marker({
      action: 'upd',
      target: ['tag'],
      ops: [
        ['replace', '/', this.tag],
      ],
    });
  }

  public getMenu(state: EditorState): MenuItem | undefined {
    const menu = this.menu;
    if (!menu) return;
    const menuItem = typeof menu === 'function' ? menu(state) : menu;
    menuItem.onSelect ??= this.action ? (() => this.action?.(state)) : (() => this.setLeafTag(state));
    const keys = this.keys;
    if (keys) menuItem.keys ??= keys.map((k) => remap[k] ?? k);
    if (keys) menuItem.right ??= () => <Sidetip small>{formatKeys(keys)}</Sidetip>;
    // if (!menuItem.icon && !!this.menuIcon) menuItem.icon = () => this.menuIcon!({size: 16});
    return menuItem;
  }
}
