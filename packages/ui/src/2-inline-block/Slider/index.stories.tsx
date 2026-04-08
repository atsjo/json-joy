import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Slider as Component, type SliderProps} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Slider',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

const Demo: React.FC<SliderProps> = (args) => {
  const [value, setValue] = React.useState(args.value ?? 50);

  return (
    <div style={{width: 250}}>
      <Component {...args} value={value} onChange={setValue} />
    </div>
  );
};

export const Primary: StoryObj<typeof meta> = {
  render: (args: any) => <Demo {...args} />,
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
  },
};

export const Interactive: StoryObj<typeof meta> = {
  render: (args: any) => <Demo {...args} />,
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
  },
};

export const WithValue: StoryObj<typeof meta> = {
  render: (args: any) => <Demo {...args} />,
  args: {
    value: 30,
    min: 0,
    max: 100,
    step: 1,
    showValue: true,
  },
};

export const FineStep: StoryObj<typeof meta> = {
  render: (args: any) => <Demo {...args} />,
  args: {
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
    showValue: true,
  },
};

export const Coarse: StoryObj<typeof meta> = {
  render: (args: any) => <Demo {...args} />,
  args: {
    value: 3,
    min: 0,
    max: 5,
    step: 1,
    showValue: true,
  },
};

export const CustomRange: StoryObj<typeof meta> = {
  render: (args: any) => <Demo {...args} />,
  args: {
    value: 20,
    min: -50,
    max: 50,
    step: 5,
    showValue: true,
  },
};

export const Disabled: StoryObj<typeof meta> = {
  render: (args: any) => <Demo {...args} />,
  args: {
    value: 40,
    min: 0,
    max: 100,
    disabled: true,
    showValue: true,
  },
};
