import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {CommandDefinition} from './types';
import type {EditorState} from '../EditorState';

const FlipIcon = makeIcon({set: 'tabler', icon: 'flip-vertical'});

export const cmds: ((state: EditorState) => CommandDefinition)[] = [
  () => ({
    name: 'Flip selection',
    icon: () => <FlipIcon width={16} height={16} />,
    cmd: 'FlipSelection',
    // group: ['Cursor'],
    domain: 'range',
    action: (state: EditorState) => {
      state.et.cursor({flip: true});
    },
  }),
];
