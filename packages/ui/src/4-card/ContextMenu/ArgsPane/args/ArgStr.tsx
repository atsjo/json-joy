import * as React from 'react';
import {Input, type InputProps} from '../../../../2-inline-block/Input';
import {FormRow} from '../../../../3-list-item/FormRow';
import {argBlockCss} from './css';
import type {ParamStr} from '../../../StructuralMenu/types';

export interface ArgStrProps extends InputProps {
  param: ParamStr;
  value: string;
}

export const ArgStr: React.FC<ArgStrProps> = ({param, ...props}) => {
  return (
    <div className={argBlockCss}>
      <FormRow title={param.display?.() ?? param.name ?? param.id} optional={param.optional}>
        <Input {...props} placeholder={param.placeholder} type="text" />
      </FormRow>
    </div>
  );
};
