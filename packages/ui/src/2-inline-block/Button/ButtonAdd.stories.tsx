import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {ButtonAdd as Component} from './ButtonAdd';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Button/ButtonAdd',
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
    children: 'Click me',
  },
};
