import * as React from 'react';
import {ArgNum, type ArgNumProps} from './ArgNum';
import {ContextPane} from '../../ContextPane';
import {ContextSep} from '../../ContextSep';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta = {
  title: '4. Card/ContextMenu/ArgsPane/ArgNum',
  component: ArgNum,
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

export const Required: StoryObj<ArgNumProps> = {
  decorators,
  args: {
    param: {
      kind: 'num',
      id: 'url',
      name: 'Link',
      optional: false,
      placeholder: 'https://example.com',
    },
    value: 0,
  },
};

export const Optional: StoryObj<ArgNumProps> = {
  decorators,
  args: {
    param: {
      kind: 'num',
      id: 'note',
      name: 'Note',
      optional: true,
      placeholder: 'Optional note…',
    },
    value: 0,
  },
};
