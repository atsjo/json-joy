import * as React from 'react';
import {type InlineAttrStack, SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import {Spoiler} from './Spoiler';

export const name = 'Spoiler';
export const Icon = makeIcon({set: 'tabler', icon: 'lock-password'});
export const behavior = spanOne(SliceTypeCon.spoiler, name, {
  menuId: 'fmt-common',
  menu: () => ({
    name,
    order: 7,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode, attr: InlineAttrStack) => (
    <Spoiler attr={attr[attr.length - 1]}>{children}</Spoiler>
  ),
});
