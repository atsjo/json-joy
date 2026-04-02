import * as React from 'react';
import {FormRow} from '../../../../3-list-item/FormRow';
import {argBlockCss} from './css';
import {InputColor, type InputColorProps} from '../../../../2-inline-block/InputColor';
import type {ParamColor} from '../../../StructuralMenu/types';

export interface ArgColorProps extends InputColorProps {
  param: ParamColor;
  value: string;
}

export const ArgColor: React.FC<ArgColorProps> = ({param, ...props}) => {
  return (
    <div className={argBlockCss}>
      <FormRow title={param.display?.() ?? param.name ?? param.id} optional={param.optional}>
        <InputColor {...props} placeholder={'#hex'} />
      </FormRow>
    </div>
  );
};
