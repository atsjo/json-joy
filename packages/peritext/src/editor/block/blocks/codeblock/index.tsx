import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {block} from '../util';
import {EditorState} from '../../../state';

export const name = 'Code block';
export const Icon = makeIcon({set: 'tabler', icon: 'code'});
export const behavior = block(SliceTypeCon.codeblock, name, {
  // keys: ['Shift', 'Primary', '1'],
  menuId: 'block-text',
  menu: (state: EditorState) => ({
    name,
    order: 3,
    icon: () => <Icon width={16} height={16} />,
  }),
});
