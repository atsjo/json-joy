import type {Meta, StoryObj} from '@storybook/react-webpack5';
import Component from './Close';

const meta: Meta<typeof Component> = {
  title: 'Icons/SVG/Close',
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
