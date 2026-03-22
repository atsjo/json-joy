import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import type {EditorState} from '../../../state';

export const name = 'Highlight';
export const Icon = makeIcon({set: 'tabler', icon: 'highlight'});
export const behavior = spanOne(SliceTypeCon.mark, name, {
  menuId: 'fmt-common',
  menu: (state: EditorState) => ({
    name,
    order: 6,
    icon: () => <Icon width={16} height={16} />,
    onSelect: () => {
      state.et.format('tog', SliceTypeCon.mark);
    },
  }),
  render: (children: React.ReactNode) => <mark>{children}</mark>,
});
