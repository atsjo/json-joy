import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import {Del} from './Del';
import type {EditorState} from '../../../state/EditorState';

export const name = 'Deletion';
export const Icon = makeIcon({set: 'tabler', icon: 'pencil-minus'});
export const behavior = spanOne(SliceTypeCon.del, name, {
  menuId: 'fmt-technical',
  menu: (state: EditorState) => ({
    name,
    order: 7,
    icon: () => <Icon width={16} height={16} />,
    onSelect: () => {
      state.et.format('tog', SliceTypeCon.del);
    },
  }),
  render: (children: React.ReactNode) => <Del>{children}</Del>,
});
