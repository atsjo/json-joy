import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {CloseCircle as Component} from '.';

const meta: Meta<typeof Component> = {
  title: 'Icons/Interactive/CloseCircle',
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
