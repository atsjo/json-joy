import * as React from 'react';
import {useT} from 'use-t';
import {useNodeView} from '@jsonjoy.com/collaborative-react';
import {ColorPickerInput} from '@jsonjoy.com/ui/lib/4-card/ColorPicker/ColorPickerInput';
import {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';
import type {EditProps} from '../../../SpanBehavior';

export const Edit: React.FC<EditProps> = ({formatting, onSave}) => {
  const [t] = useT();
  const obj = formatting.conf()!;
  const view = useNodeView(obj);
  const [color, setColor] = React.useState(HslColor.from(String(view?.col || '#000000')) as HslColor);
  const [colorInput, setColorInput] = React.useState(color.toRgb().hex());

  return (
    <div style={{width: 'calc(min(240px, 100vw))'}}>
      <ColorPickerInput
        style={{width: '100%'}}
        color={color}
        onChange={(newColor) => {
          const hex = newColor.toRgb().hex().toUpperCase();
          setColor(newColor);
          setColorInput(hex);
          obj.replace('/col', hex);
        }}
      />
    </div>
  );
};
