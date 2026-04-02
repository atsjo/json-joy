import * as React from 'react';
import {ContextPane, type ContextPaneProps} from '../ContextMenu';
import {rule} from 'nano-theme';

const flexClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'center',
  pd: '4px',
  h: '32px',
});

export interface ToolbarPaneProps extends ContextPaneProps {
  children?: React.ReactNode;
  compact?: boolean;
}

export const ToolbarPane: React.FC<ToolbarPaneProps> = ({children, ...rest}) => {
  let style: React.CSSProperties | undefined = rest.style;

  if (rest.compact) {
    style = {padding: 2};
  }

  return (
    <ContextPane {...rest}>
      <div className={flexClass} style={style}>
        {children}
      </div>
    </ContextPane>
  );
};
