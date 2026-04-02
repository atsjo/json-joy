import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';

export const name = 'Strikethrough';
export const Icon = makeIcon({set: 'tabler', icon: 'strikethrough'});
export const behavior = spanOne(SliceTypeCon.s, name, {
  keys: ['Shift', 'Primary', 'x'],
  menuId: 'fmt-common',
  menu: () => ({
    name,
    order: 4,
    icon: () => <Icon width={16} height={16} />,
  }),
  text: (style) => {
    style.textDecoration = (style.textDecoration ? style.textDecoration + ' ' : '') + 'line-through';
  },
});
