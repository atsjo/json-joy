import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {CommandDefinition} from "./types";

const FlipIcon = makeIcon({set: 'tabler', icon: 'flip-vertical'});

export const cmds: CommandDefinition[] = [
  {
    name: 'Flip selection',
    icon: () => <FlipIcon width={16} height={16} />,
    cmd: 'FlipSelection',
    group: ['Selection'],
    domain: 'range',
    action: (state) => {
      state.et.cursor({flip: true});
    },
  },
];
