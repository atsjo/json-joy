import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';

export const name = 'Overline';
export const Icon = makeIcon({set: 'tabler', icon: 'overline'});
export const behavior = spanOne(SliceTypeCon.overline, name, {
  menuId: 'fmt-common',
  menu: () => ({
    name,
    order: 5,
    icon: () => <Icon width={16} height={16} />,
  }),
  text: (style) => {
    style.textDecoration = (style.textDecoration ? style.textDecoration + ' ' : '') + 'overline';
  },
});
