import * as React from 'react';
import {FormRow} from '../../../../3-list-item/FormRow';
import {Checkbox} from '../../../../2-inline-block/Checkbox';
import {argBlockCss} from './css';
import type {ParamBool} from '../../../StructuralMenu/types';

export interface ArgBoolProps {
  param: ParamBool;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const ArgBool: React.FC<ArgBoolProps> = ({param, value, onChange}) => {
  return (
    <div className={argBlockCss}>
      <FormRow
        title={param.display?.() ?? param.name ?? param.id}
        optional={param.optional}
        description={param.description}
        right
      >
        <div style={{width: 40}}>
          <Checkbox on={value} small onChange={() => onChange(!value)} />
        </div>
      </FormRow>
    </div>
  );
};
