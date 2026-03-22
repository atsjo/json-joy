import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';

export const name = 'Superscript';
export const Icon = makeIcon({set: 'tabler', icon: 'superscript'});
export const behavior = spanOne(SliceTypeCon.sup, name, {
  menu: {
    name: name,
    icon: () => <Icon width={16} height={16} />,
    onSelect: () => {
      // et.format('tog', CommonSliceType.sup);
    },
  },
  render: (children: React.ReactNode) => <sup>{children}</sup>,
});
