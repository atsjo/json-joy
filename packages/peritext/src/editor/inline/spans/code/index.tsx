import * as React from 'react';
import {type InlineAttrStack, SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import {Code} from './Code';

export const name = 'Code';
export const Icon = makeIcon({set: 'tabler', icon: 'code'});
export const behavior = spanOne(SliceTypeCon.code, name, {
  keys: ['Primary', 'e'],
  menuId: 'fmt-technical',
  menu: () => ({
    name,
    order: 1,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode, attr: InlineAttrStack) => <Code attr={attr[attr.length - 1]}>{children}</Code>,
});
