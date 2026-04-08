import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {AvatarBlock as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/AvatarBlock',
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
    name: 'Vadim Da',
    subtext: 'living dad',
    grey: true,
  },
};
