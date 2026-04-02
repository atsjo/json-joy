import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {block} from '../util';
import type {EditorState} from '../../../state';

export const name = 'Heading 4';
export const Icon = makeIcon({set: 'tabler', icon: 'h-4'});
export const behavior = block(SliceTypeCon.h4, name, {
  // keys: ['Shift', 'Primary', '4'],
  menuId: 'block-h',
  menu: (state: EditorState) => ({
    name,
    order: 4,
    icon: () => <Icon width={16} height={16} />,
  }),
});
