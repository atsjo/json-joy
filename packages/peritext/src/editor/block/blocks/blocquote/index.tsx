import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {block} from '../util';

export const name = 'Blockquote';
export const Icon = makeIcon({set: 'lucide', icon: 'quote'});
export const behavior = block(SliceTypeCon.blockquote, name, {
  keys: ['Shift', 'Primary', '1'],
  menuId: 'block-text',
  menu: {
    name,
    order: 1,
    icon: () => <Icon width={15} height={15} />,
  },
});
