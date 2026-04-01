import * as React from 'react';
import {Input, InputProps} from '../../../../2-inline-block/Input';
import {FormRow} from '../../../../3-list-item/FormRow';
import {argBlockCss} from './css';
import type {ParamNum} from '../../../StructuralMenu/types';

export interface ArgNumProps extends Omit<InputProps, 'value' | 'onChange'> {
  param: ParamNum;
  value: number;
  onChange: (value: number) => void;
}

export const ArgNum: React.FC<ArgNumProps> = ({param, value, onChange, ...props}) => {
  return (
    <div className={argBlockCss}>
      <FormRow title={param.display?.() ?? param.name ?? param.id} optional={param.optional}>
        <Input
          {...props}
          placeholder={param.placeholder}
          type="number"
          value={value + ''}
          onChange={(txt) => {
            const num = Number(txt);
            if (!Number.isNaN(num)) onChange(num);
          }}
        />
      </FormRow>
    </div>
  );
};
