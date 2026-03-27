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

  public getMenu(state: EditorState): MenuItem | undefined {
    const menu = this.menu;
    if (!menu) return;
    const menuItem = typeof menu === 'function' ? menu(state) : menu;
    // menuItem.onSelect ??= () => this.action?.(state);
    const keys = this.keys;
    if (keys) menuItem.keys ??= keys.map((k) => remap[k] ?? k);
    if (keys) menuItem.right ??= () => <Sidetip small>{formatKeys(keys)}</Sidetip>;
    // if (!menuItem.icon && !!this.menuIcon) menuItem.icon = () => this.menuIcon!({size: 16});
    return menuItem;
  }
}

// export interface BlockIconProps {
//   size: number;
// }
