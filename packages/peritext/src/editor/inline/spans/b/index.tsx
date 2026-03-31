import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {spanOne} from '../util';
import {DynamicCommandDefinition} from '../../../state/commands/types';
import {MenuItem} from '../../../types';
import type {EditorState} from '../../../state/EditorState';

export const name = 'Bold';
export const Icon = makeIcon({set: 'radix', icon: 'font-bold'});

const cmdName = name;
const icon = () => <Icon width={15} height={15} />;
const menu: MenuItem = {
  name,
  description: 'Toggle bold formatting for the selected text.',
  order: 1,
  icon,
};

// const cmd: DynamicCommandDefinition = () => ({
//   ...menu,
//   cmd: cmdName,
//   domain: 'range',
//   action: (state) => {
//     state.surface.headless.cmd.exec('FormatToggle', SliceTypeCon.b);
//   },
// });

export const behavior = spanOne(SliceTypeCon.b, name, {
  keys: ['Primary', 'b'],
  action: (state: EditorState) => state.cmd?.run(cmdName),
  menuId: 'fmt-common',
  menu: () => ({...menu}),
  text: (style) => {
    style.fontWeight = 'bold';
  },
}, {
  action: (state) => {
    state.surface.headless.cmd.exec('FormatToggle', SliceTypeCon.b);
  },
});
