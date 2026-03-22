import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  bg: 'rgba(152,235,167,.3)',
  bxsh: '0 2px 0 0 rgba(152,225,167,.6)',
  td: 'none',
});

export interface InsProps {
  children: React.ReactNode;
}

export const Ins: React.FC<InsProps> = (props) => {
  const {children} = props;

  return <ins className={blockClass}>{children}</ins>;
};
