import * as React from 'react';
import {rule} from 'nano-theme';

const delClass = rule({
  bg: 'rgba(240,190,190,.4)',
  bxsh: '0 2px 0 0 rgba(255,177,177,.5)',
  col: 'red',
});

export interface DelProps {
  children: React.ReactNode;
}

export const Del: React.FC<DelProps> = (props) => {
  const {children} = props;

  return <del className={delClass}>{children}</del>;
};
