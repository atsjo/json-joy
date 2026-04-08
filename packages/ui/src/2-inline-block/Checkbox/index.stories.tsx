import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Checkbox as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Checkbox',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {},
};
