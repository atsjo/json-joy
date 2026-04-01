import * as React from 'react';
import {ArgSelect, ArgSelectProps} from './ArgSelect';
import {ContextPane} from '../../ContextPane';
import {ContextSep} from '../../ContextSep';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta = {
  title: '4. Card/ContextMenu/ArgsPane/ArgSelect',
  component: ArgSelect,
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

export const Required: StoryObj<ArgSelectProps> = {
  decorators,
  args: {
    param: {
      kind: 'select',
      id: 'font',
      name: 'Font family',
      description: 'Select the font for the card',
      optional: false,
      options: [
        {id: 'inter', name: 'Inter'},
        {id: 'roboto', name: 'Roboto'},
        {id: 'arial', name: 'Arial'},
        {id: 'helvetica', name: 'Helvetica'},
        {id: 'georgia', name: 'Georgia'},
        {id: 'times', name: 'Times New Roman'},
        {id: 'courier', name: 'Courier New'},
        {id: 'monaco', name: 'Monaco'},
        {id: 'fira', name: 'Fira Code'},
        {id: 'jetbrains', name: 'JetBrains Mono'},
      ],
    },
    value: 'roboto',
  },
};
