import * as React from 'react';
import {InlineAttrStack, SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import {Code} from './Code';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';

export const name = 'Code';
export const Icon = makeIcon({set: 'tabler', icon: 'code'});
export const behavior = spanOne(SliceTypeCon.code, name, {
  menu: {
    name,
    icon: () => <Icon width={16} height={16} />,
    right: () => <Sidetip small>⌘ E</Sidetip>,
    keys: ['⌘', 'e'],
    onSelect: () => {
      // this.trackRecent(this.inlineCode);
      // this.et().format('tog', CommonSliceType.code);
    },
  },
  render: (children: React.ReactNode, attr: InlineAttrStack) =>
    <Code attr={attr[attr.length - 1]}>{children}</Code>,
});
