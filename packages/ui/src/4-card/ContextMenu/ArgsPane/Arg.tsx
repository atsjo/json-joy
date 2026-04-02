import * as React from 'react';
import {ArgStr} from './args/ArgStr';
import {ArgNum} from './args/ArgNum';
import {ArgBool} from './args/ArgBool';
import {ArgColor} from './args/ArgColor';
import {ArgSelect} from './args/ArgSelect';
import type {Param} from '../../StructuralMenu/types';

export interface ArgControlProps {
  param: Param;
  value: unknown;
  focus?: boolean;
  onChange: (value: unknown) => void;
  onSubmit: () => void;
}

export const Arg: React.FC<ArgControlProps> = ({param, value, onChange, onSubmit, focus}) => {
  switch (param.kind) {
    case 'str':
      return (
        <ArgStr param={param} value={(value as string) ?? ''} onChange={onChange} onEnter={onSubmit} focus={focus} />
      );
    case 'num':
      return <ArgNum param={param} value={Number(value) || 0} onChange={onChange} onEnter={onSubmit} focus={focus} />;
    case 'bool':
      return <ArgBool param={param} value={!!value} onChange={onChange} />;
    case 'color':
      return (
        <ArgColor param={param} value={(value as string) ?? ''} onChange={onChange} onEnter={onSubmit} focus={focus} />
      );
    case 'select':
      return <ArgSelect param={param} value={(value as string) ?? ''} onChange={onChange} onSubmit={onSubmit} />;
    default:
      return null;
  }
};
