import * as React from 'react';
import {ColorPickerInput} from './ColorPickerInput';
import {HslColor} from '../../styles/color/HslColor';

export default {
  component: ColorPickerInput,
  title: '4. Card/ColorPicker/ColorPickerInput',
};

export const Default = {
  render: () => <ColorPickerInput color="#3b82f6" />,
};

export const NoAlpha = {
  render: () => <ColorPickerInput color="#10b981" noAlpha />,
};

const Controlled: React.FC = () => {
  const [color, setColor] = React.useState(() => HslColor.from('#f97316')!);
  return (
    <div style={{display: 'flex', gap: 24, alignItems: 'flex-start'}}>
      <ColorPickerInput color={color} onChange={(result: HslColor) => setColor(result)} />
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          background: color.toString(),
          border: '1px solid rgba(0,0,0,.12)',
          flexShrink: 0,
        }}
      />
    </div>
  );
};

export const ControlledWithPreview = {
  render: () => <Controlled />,
};
