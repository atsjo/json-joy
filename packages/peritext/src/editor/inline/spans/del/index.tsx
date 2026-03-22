import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import {Del} from './Del';

export const name = 'Deletion';
export const Icon = makeIcon({set: 'tabler', icon: 'pencil-minus'});
export const behavior = spanOne(SliceTypeCon.del, name, {
  menu: {
    name: name,
    icon: () => <Icon width={16} height={16} />,
    onSelect: () => {
      // et.format('tog', CommonSliceType.del);
    },
  },
  render: (children: React.ReactNode) => <Del>{children}</Del>,
});
