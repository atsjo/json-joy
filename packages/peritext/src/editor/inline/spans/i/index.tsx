import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import type {EditorState} from '../../../state/EditorState';

export const name = 'Italic';
export const Icon = makeIcon({set: 'lucide', icon: 'italic'});
export const behavior = spanOne(SliceTypeCon.i, name, {
  keys: ['Primary', 'i'],
  action: (state: EditorState) => {
    state.et.format('tog', SliceTypeCon.i);
  },
  menuId: 'fmt-common',
  menu: (state: EditorState) => ({
    name,
    order: 2,
    icon: () => <Icon width={14} height={14} />,
  }),
  text: (style) => {
    style.fontStyle = 'italic';
  },
});
