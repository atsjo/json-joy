import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import type {EditorState} from '../../../state/EditorState';

export const name = 'Strikethrough';
export const Icon = makeIcon({set: 'tabler', icon: 'strikethrough'});
export const behavior = spanOne(SliceTypeCon.s, name, {
  menuId: 'fmt-common',
  menu: (state: EditorState) => ({
    name,
    icon: () => <Icon width={16} height={16} />,
    onSelect: () => {
      state.et.format('tog', SliceTypeCon.s);
    },
  }),
  text: (style) => {
    style.textDecoration = (style.textDecoration ? style.textDecoration + ' ' : '') + 'line-through';
  },
});
