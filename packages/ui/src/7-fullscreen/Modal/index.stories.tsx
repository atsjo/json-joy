import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Modal as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '7. Fullscreen/Modal',
  component: Component,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    children: 'Children ...',
  },
};
