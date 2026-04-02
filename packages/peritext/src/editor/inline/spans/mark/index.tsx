import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';

export const name = 'Highlight';
export const Icon = makeIcon({set: 'tabler', icon: 'highlight'});
export const behavior = spanOne(SliceTypeCon.mark, name, {
  menuId: 'fmt-common',
  menu: () => ({
    name,
    order: 6,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode) => <mark>{children}</mark>,
});
