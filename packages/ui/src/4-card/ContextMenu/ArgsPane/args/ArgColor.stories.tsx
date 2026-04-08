import * as React from 'react';
import {ArgColor, type ArgColorProps} from './ArgColor';
import {ContextPane} from '../../ContextPane';
import {ContextSep} from '../../ContextSep';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta = {
  title: '4. Card/ContextMenu/ArgsPane/ArgColor',
  component: ArgColor,
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

export const Required: StoryObj<ArgColorProps> = {
  decorators,
  args: {
    param: {
      kind: 'color',
      id: 'color',
      name: 'Color',
      optional: false,
      placeholder: '#0077ff',
    },
    value: '#0077ff',
  },
};
