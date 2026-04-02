import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {block} from '../util';
import type {EditorState} from '../../../state';

export const name = 'Math block';
export const Icon = makeIcon({set: 'tabler', icon: 'math'});
export const behavior = block(SliceTypeCon.mathblock, name, {
  // keys: ['Shift', 'Primary', '1'],
  menuId: 'block-text',
  menu: (state: EditorState) => ({
    name,
    order: 4,
    icon: () => <Icon width={16} height={16} />,
  }),
});
