import * as React from 'react';
import {ArgBool, type ArgBoolProps} from './ArgBool';
import {ContextPane} from '../../ContextPane';
import {ContextSep} from '../../ContextSep';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta = {
  title: '4. Card/ContextMenu/ArgsPane/ArgBool',
  component: ArgBool,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

const decorators = [
  (Story: any) => (
    <ContextPane>
      <ContextSep />
      <Story />
      <ContextSep />
    </ContextPane>
  ),
];

export const Required: StoryObj<ArgBoolProps> = {
  decorators,
  args: {
    param: {
      kind: 'bool',
      id: 'url',
      name: 'Link',
      description: 'Whether to open the link in a new tab',
      optional: false,
    },
    value: false,
  },
};

export const Optional: StoryObj<ArgBoolProps> = {
  decorators,
  args: {
    param: {
      kind: 'bool',
      id: 'note',
      name: 'Note',
      optional: true,
    },
    value: false,
  },
};
