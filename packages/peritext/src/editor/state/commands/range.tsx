import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {formatKeys} from '../../util/keys';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import type {CommandDefinition} from './types';
import type {EditorState} from '../EditorState';

const Icon = makeIcon({set: 'tabler', icon: 'flip-vertical'});
const keys = ['Primary', 'Primary'];

export const cmds: ((state: EditorState) => CommandDefinition)[] = [
  () => ({
    name: 'FlipSelection',
    code: true,
    icon: () => <Icon width={16} height={16} />,
    right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
    // keys: ['Primary', 'Primary'],
    // cmd: 'FlipSelection',
    // group: ['Cursor'],
    domain: 'range',
    action: (state: EditorState) => {
      state.et.cursor({flip: true});
    },
  }),
];
