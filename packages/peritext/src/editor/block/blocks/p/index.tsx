import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {block} from '../util';

export const name = 'Paragraph';
export const Icon = makeIcon({set: 'lucide', icon: 'pilcrow'});
export const behavior = block(SliceTypeCon.p, name, {
  keys: ['Shift', 'Primary', '0'],
  menuId: 'block-text',
  menu: {
    name,
    order: 1,
    icon: () => <Icon width={16} height={16} />,
  },
});
