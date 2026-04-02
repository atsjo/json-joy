import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';

export const name = 'Underline';
export const Icon = makeIcon({set: 'tabler', icon: 'underline'});
export const behavior = spanOne(SliceTypeCon.u, name, {
  keys: ['Primary', 'u'],
  menuId: 'fmt-common',
  menu: () => ({
    name,
    order: 3,
    icon: () => <Icon width={16} height={16} />,
  }),
  text: (style) => {
    style.textDecoration = (style.textDecoration ? style.textDecoration + ' ' : '') + 'underline';
  },
});
