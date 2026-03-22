import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import type {EditorState} from '../../../state/EditorState';

export const name = 'Italic';
export const Icon = makeIcon({set: 'lucide', icon: 'italic'});
export const behavior = spanOne(SliceTypeCon.i, name, {
  menuId: 'fmt-common',
  menu: (state: EditorState) => ({
    name,
    icon: () => <Icon width={14} height={14} />,
    right: () => <Sidetip small>⌘ I</Sidetip>,
    keys: ['⌘', 'i'],
    onSelect: () => {
      state.et.format('tog', SliceTypeCon.i);
    },
  }),
  text: (style) => {
    style.fontStyle = 'italic';
  },
});
