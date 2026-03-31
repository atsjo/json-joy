import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';

export const name = 'Subscript';
export const Icon = makeIcon({set: 'tabler', icon: 'subscript'});
export const behavior = spanOne(SliceTypeCon.sub, name, {
  menuId: 'fmt-technical',
  menu: (state: EditorState) => ({
    name,
    order: 4,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode) => <sub>{children}</sub>,
});
