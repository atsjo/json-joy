import * as React from 'react';
import {InlineAttrStack, SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import {Code} from './Code';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import type {EditorState} from '../../../state';

export const name = 'Code';
export const Icon = makeIcon({set: 'tabler', icon: 'code'});
export const behavior = spanOne(SliceTypeCon.code, name, {
  keys: ['Primary', 'e'],
  action: (state: EditorState) => {
    state.et.format('tog', SliceTypeCon.code);
  },
  menuId: 'fmt-technical',
  menu: (state: EditorState) => ({
    name,
    order: 1,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode, attr: InlineAttrStack) =>
    <Code attr={attr[attr.length - 1]}>{children}</Code>,
});
