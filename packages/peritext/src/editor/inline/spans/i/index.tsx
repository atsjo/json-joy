import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';

export const name = 'Italic';
export const Icon = makeIcon({set: 'lucide', icon: 'italic'});
export const behavior = spanOne(SliceTypeCon.i, name, {
  keys: ['Primary', 'i'],
  menuId: 'fmt-common',
  menu: () => ({
    name,
    order: 2,
    icon: () => <Icon width={14} height={14} />,
  }),
  text: (style) => {
    style.fontStyle = 'italic';
  },
});
