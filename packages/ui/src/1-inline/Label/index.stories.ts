import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Label as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Label',
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
    children: 'Some label',
  },
};
