import * as React from 'react';
import {InlineAttrStack, SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import {Kbd} from './Kbd';
import type {EditorState} from '../../../state/EditorState';

export const name = 'Keyboard key';
export const Icon = makeIcon({set: 'lucide', icon: 'keyboard'});
export const behavior = spanOne(SliceTypeCon.kbd, name, {
  menuId: 'fmt-technical',
  menu: (state: EditorState) => ({
    name,
    order: 5,
    icon: () => <Icon width={16} height={16} />,
    onSelect: () => {
      state.et.format('tog', SliceTypeCon.kbd);
    },
  }),
  render: (children: React.ReactNode, attr: InlineAttrStack) =>
    <Kbd attr={attr[attr.length - 1]}>{children}</Kbd>,
});
