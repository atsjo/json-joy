import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';

export const Icon = makeIcon({set: 'tabler', icon: 'highlight'});
const NAME = 'Highlight';

export const behavior = spanOne(SliceTypeCon.mark, NAME, {
  menu: {
    name: NAME,
    icon: () => <Icon width={16} height={16} />,
    onSelect: () => {
      // et.format('tog', CommonSliceType.mark);
    },
  },
  render: (children: React.ReactNode) => <mark>{children}</mark>,
});
