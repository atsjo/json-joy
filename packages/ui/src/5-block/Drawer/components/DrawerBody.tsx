import * as React from 'react';
import {rule} from 'nano-theme';

const bodyClass = rule({
  flex: 1,
  minH: 0,
  ov: 'auto',
  bxz: 'border-box',
  pad: '12px 12px 16px',
});

export interface DrawerBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DrawerBody: React.FC<DrawerBodyProps> = ({children, className, ...rest}) => {
  return (
    <div {...rest} className={bodyClass + (className ? ' ' + className : '')}>
      {children}
    </div>
  );
};
