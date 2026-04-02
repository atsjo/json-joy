import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {block} from '../util';
import type {EditorState} from '../../../state';

export const name = 'Heading 5';
export const Icon = makeIcon({set: 'tabler', icon: 'h-5'});
export const behavior = block(SliceTypeCon.h5, name, {
  // keys: ['Shift', 'Primary', '5'],
  menuId: 'block-h',
  menu: (state: EditorState) => ({
    name,
    order: 5,
    icon: () => <Icon width={16} height={16} />,
  }),
});
