import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {block} from '../util';
import type {EditorState} from '../../../state';

export const name = 'Pre-formatted';
export const Icon = makeIcon({set: 'lucide', icon: 'type'});
export const behavior = block(SliceTypeCon.pre, name, {
  // keys: ['Shift', 'Primary', '1'],
  menuId: 'block-text',
  menu: (state: EditorState) => ({
    name,
    order: 5,
    icon: () => <Icon width={16} height={16} />,
  }),
});
