import * as React from 'react';
import {drule, useTheme} from 'nano-theme';

const headerClass = drule({
  d: 'flex',
  ai: 'center',
  flexShrink: 0,
  bxz: 'border-box',
  pd: '16px',
});

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({children, className = '', ...rest}) => {
  const theme = useTheme();

  return (
    <div
      {...rest}
      className={
        className +
        headerClass({
          bdb: `1px solid ${theme.g(0, 0.08)}`,
        })
      }
    >
      {children}
    </div>
  );
};
