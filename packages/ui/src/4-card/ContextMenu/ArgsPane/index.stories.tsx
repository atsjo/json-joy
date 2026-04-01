import * as React from 'react';
import {ArgsPane, ArgsPaneProps} from './index';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta = {
  title: '4. Card/ContextMenu/ArgsPane',
  component: ArgsPane,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Default: StoryObj<ArgsPaneProps> = {
  args: {
    item: {
      name: 'Open Link',
    },
    params: [
      {
        kind: 'str',
        id: 'note',
        name: 'Note',
        placeholder: 'Optional note…'
      },
      {
        kind: 'bool',
        id: 'poster',
        name: 'Use as poster',
        description: 'Whether to use the link as a poster',
        optional: false,
      },
      {
        kind: 'bool',
        id: 'private',
        name: 'Private',
        default: true,
      },
      {
        kind: 'num',
        id: 'size',
        name: 'Size',
        optional: true,
        placeholder: 'Size in MB',
        default: 10
      },
      {
        kind: 'color',
        id: 'color',
        name: 'Color',
        optional: true,
        default: '#0077ff'
      },
      {
        kind: 'select',
        id: 'quality',
        name: 'Quality',
        optional: true,
        default: 'medium',
        options: [
          {name: 'low', display: () => 'Low'},
          {name: 'medium', display: () => 'Medium'},
          {name: 'high', display: () => 'High'},
        ],
      },
    ],
  },
};
