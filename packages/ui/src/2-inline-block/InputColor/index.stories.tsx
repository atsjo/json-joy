import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {InputColor as Component, type InputColorProps} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/InputColor',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const DemoColor: React.FC<InputColorProps> = (props) => {
  const [value, setValue] = React.useState(props.value || '#3366FF');

  return (
    <div>
      <Component label={'Color'} value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
      <Component value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
      <Component size={-2} value={value} onChange={(value) => setValue(value)} {...props} />
      <br />
      <Component disabled label={'Disabled'} value={value} onChange={(value) => setValue(value)} {...props} />
    </div>
  );
};

export const Default: StoryObj<typeof meta> = {
  render: (args: any) => <DemoColor {...args} />,
};
