import * as React from 'react';
import {rule, theme} from 'nano-theme';
import type {ParamStr} from '../../../StructuralMenu/types';
import {Input, InputProps} from '../../../../2-inline-block/Input';
import {FormRow} from '../../../../3-list-item/FormRow';

const blockClass = rule({
  pad: '4px 16px 8px',
});

export interface ArgStrProps extends InputProps {
  param: ParamStr;
  value: string;
}

export const ArgStr: React.FC<ArgStrProps> = ({param, ...props}) => {
  return (
    <div className={blockClass}>
      <FormRow title={param.display?.() ?? param.name ?? param.id} optional={param.optional}>
        <Input
          {...props}
          placeholder={param.placeholder}
          type="text"
        />
      </FormRow>
    </div>
  );
};
