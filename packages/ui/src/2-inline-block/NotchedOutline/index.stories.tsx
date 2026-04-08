import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {NotchedOutline as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/NotchedOutline',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    label: 'Label',
    children: 'Children',
  },
};
