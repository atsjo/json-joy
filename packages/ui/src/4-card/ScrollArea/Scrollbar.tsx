import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {useScrollArea} from './context';
import {useSyncStore} from '../../hooks/useSyncStore';
import type {ScrollAreaScrollbarProps} from './types';

const scrollbarClass = rule({
  pos: 'absolute',
  top: 0,
  r: 0,
  b: 0,
  trs: 'opacity 0.15s ease',
  z: 1,
});

export const Scrollbar: React.FC<ScrollAreaScrollbarProps> = ({children, className, style, ...rest}) => {
  const state = useScrollArea();
  const theme = useTheme();
  const visible = useSyncStore(state.visible$);
  const alwaysVisible = useSyncStore(state.alwaysVisible$);
  const railWidth = useSyncStore(state.railWidth$);
  const canScroll = useSyncStore(state.canScroll$);
  const isVisible = alwaysVisible || visible;

  if (!canScroll && !alwaysVisible) return null;

  return (
    <div
      {...rest}
      ref={state.setRail}
      className={scrollbarClass + (className ? ' ' + className : '')}
      data-state={isVisible ? 'visible' : 'hidden'}
      style={{
        width: railWidth,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        background: theme.isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
        ...style,
      }}
      onPointerDown={state.onScrollbarPointerDown}
      onPointerMove={state.onScrollbarPointerMove}
      onPointerUp={state.onScrollbarPointerUp}
      onWheel={state.onScrollbarWheel}
      onPointerEnter={state.onScrollbarPointerEnter}
    >
      {children}
    </div>
  );
};
