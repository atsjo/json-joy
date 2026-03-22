import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import type {EditorState} from '../../../state/EditorState';

export const name = 'Underline';
export const Icon = makeIcon({set: 'tabler', icon: 'underline'});
export const behavior = spanOne(SliceTypeCon.u, name, {
  menuId: 'fmt-common',
  menu: (state: EditorState) => ({
    name,
    icon: () => <Icon width={16} height={16} />,
    right: () => <Sidetip small>⌘ U</Sidetip>,
    keys: ['⌘', 'u'],
    onSelect: () => {
      state.et.format('tog', SliceTypeCon.u);
    },
  }),
  text: (style) => {
    style.textDecoration = (style.textDecoration ? style.textDecoration + ' ' : '') + 'underline';
  },
});
