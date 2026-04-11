import * as React from 'react';
import {rule, makeRule} from 'nano-theme';

const headerClass = rule({
  d: 'flex',
  ai: 'center',
  flexShrink: 0,
  bxz: 'border-box',
  pad: '14px 16px 12px',
});

const useHeaderClass = makeRule((theme) => ({
  bdb: `1px solid ${theme.isLight ? 'rgba(15,23,42,.08)' : 'rgba(255,255,255,.08)'}`,
}));

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({children, className, ...rest}) => {
  const dynamicClass = useHeaderClass();
  return (
    <div {...rest} className={headerClass + dynamicClass + (className ? ' ' + className : '')}>
      {children}
    </div>
  );
};
