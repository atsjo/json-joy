import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import type {MenuItem} from '../../../types';

export const name = 'Bold';
export const Icon = makeIcon({set: 'radix', icon: 'font-bold'});

const icon = () => <Icon width={15} height={15} />;
const menu: MenuItem = {
  name,
  order: 1,
  icon,
};

export const behavior = spanOne(SliceTypeCon.b, name, {
  keys: ['Primary', 'b'],
  menuId: 'fmt-common',
  menu: () => ({...menu}),
  text: (style) => {
    style.fontWeight = 'bold';
  },
});
