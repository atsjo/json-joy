import * as React from 'react';
import {rule} from 'nano-theme';
import {ScrollState} from './state';
import {ctx} from './context';
import type {ScrollAreaRootProps} from './types';

const rootClass = rule({
  pos: 'relative',
  d: 'flex',
  flexDirection: 'column',
  ov: 'hidden',
});

export const Root: React.FC<ScrollAreaRootProps> = ({
  state: externalState,
  alwaysVisible,
  railWidth,
  hideDelay,
  minThumbSize,
  children,
  className,
  style,
  ...rest
}) => {
  const state = React.useMemo(() => {
    if (externalState) return externalState;
    return new ScrollState({alwaysVisible, railWidth, hideDelay, minThumbSize});
  }, [externalState]);

  React.useLayoutEffect(() => {
    if (!externalState) {
      if (alwaysVisible !== undefined) state.alwaysVisible$.next(alwaysVisible);
      if (railWidth !== undefined) state.railWidth$.next(railWidth);
    }
  }, [alwaysVisible, railWidth, externalState, state]);

  React.useLayoutEffect(() => state.start(), [state]);

  return (
    <ctx.Provider value={state}>
      <div {...rest} className={rootClass + (className ? ' ' + className : '')} style={style}>
        {children}
      </div>
    </ctx.Provider>
  );
};
