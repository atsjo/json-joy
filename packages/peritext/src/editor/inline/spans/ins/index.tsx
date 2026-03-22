import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import {Ins} from './Ins';

export const name = 'Insertion';
export const Icon = makeIcon({set: 'tabler', icon: 'pencil-plus'});
export const behavior = spanOne(SliceTypeCon.ins, name, {
  menu: {
    name: name,
    icon: () => <Icon width={16} height={16} />,
    onSelect: () => {
      // et.format('tog', CommonSliceType.ins);
    },
  },
  render: (children: React.ReactNode) => <Ins>{children}</Ins>,
});
