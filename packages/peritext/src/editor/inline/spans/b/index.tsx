import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import type {EditorState} from '../../../state/EditorState';

export const name = 'Bold';
export const Icon = makeIcon({set: 'radix', icon: 'font-bold'});
export const behavior = spanOne(SliceTypeCon.b, name, {
  keys: ['⌘', 'b'],
  action: (state: EditorState) => {
    state.et.format('tog', SliceTypeCon.b);
  },
  menuId: 'fmt-common',
  menu: {
    name,
    order: 1,
    icon: () => <Icon width={15} height={15} />,
    // right: () => <Sidetip small>⌘ B</Sidetip>,
  },
  text: (style) => {
    style.fontWeight = 'bold';
  },
});
