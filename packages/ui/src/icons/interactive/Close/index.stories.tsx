import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Close as Component} from '.';

const meta: Meta<typeof Component> = {
  title: 'Icons/Interactive/Close',
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
