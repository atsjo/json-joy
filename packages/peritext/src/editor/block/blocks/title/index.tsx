import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {block} from '../util';
import type {EditorState} from '../../../state';

export const name = 'Title';
export const Icon = makeIcon({set: 'lucide', icon: 'type'});
export const behavior = block(SliceTypeCon.title, name, {
  // keys: ['Shift', 'Primary', '6'],
  menuId: 'block-h',
  menu: (state: EditorState) => ({
    name,
    order: 7,
    sepBefore: true,
    icon: () => <Icon width={16} height={16} />,
  }),
});
