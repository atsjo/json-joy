import * as React from 'react';
import {ArgStr, type ArgStrProps} from './ArgStr';
import {ContextPane} from '../../ContextPane';
import {ContextSep} from '../../ContextSep';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta = {
  title: '4. Card/ContextMenu/ArgsPane/ArgStr',
  component: ArgStr,
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

export const Required: StoryObj<ArgStrProps> = {
  decorators,
  args: {
    param: {
      kind: 'str',
      id: 'url',
      name: 'Link',
      optional: false,
      placeholder: 'https://example.com',
    },
    value: '',
  },
};

export const Optional: StoryObj<ArgStrProps> = {
  decorators,
  args: {
    param: {
      kind: 'str',
      id: 'note',
      name: 'Note',
      optional: true,
      placeholder: 'Optional note…',
    },
    value: '',
  },
};

export const WithDefault: StoryObj<ArgStrProps> = {
  decorators,
  args: {
    param: {
      kind: 'str',
      id: 'name',
      name: 'Name',
      optional: false,
      default: 'Untitled',
    },
    value: 'Untitled',
  },
};
