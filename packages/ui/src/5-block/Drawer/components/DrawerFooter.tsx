import * as React from 'react';
import {rule, makeRule} from 'nano-theme';

const footerClass = rule({
  d: 'flex',
  ai: 'center',
  flexShrink: 0,
  bxz: 'border-box',
  pad: '12px 16px 14px',
});

const useFooterClass = makeRule((theme) => ({
  bdt: `1px solid ${theme.isLight ? 'rgba(15,23,42,.08)' : 'rgba(255,255,255,.08)'}`,
}));

export interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({children, className, ...rest}) => {
  const dynamicClass = useFooterClass();
  return (
    <div {...rest} className={footerClass + dynamicClass + (className ? ' ' + className : '')}>
      {children}
    </div>
  );
};
