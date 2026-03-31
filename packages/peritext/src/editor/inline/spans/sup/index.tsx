import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';

export const name = 'Superscript';
export const Icon = makeIcon({set: 'tabler', icon: 'superscript'});
export const behavior = spanOne(SliceTypeCon.sup, name, {
  menuId: 'fmt-technical',
  menu: () => ({
    name,
    order: 3,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode) => <sup>{children}</sup>,
});
