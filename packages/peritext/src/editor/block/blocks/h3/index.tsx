import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {block} from '../util';
import {EditorState} from '../../../state';

export const name = 'Heading 3';
export const Icon = makeIcon({set: 'tabler', icon: 'h-3'});
export const behavior = block(SliceTypeCon.h3, name, {
  // keys: ['Shift', 'Primary', '3'],
  menuId: 'block-h',
  menu: (state: EditorState) => ({
    name,
    order: 3,
    icon: () => <Icon width={16} height={16} />,
  }),
});
