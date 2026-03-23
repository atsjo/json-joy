import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {useScrollArea} from './context';
import {useSyncStore} from '../../hooks/useSyncStore';
import type {ScrollAreaThumbProps} from './types';

const thumbClass = rule({
  pos: 'absolute',
  l: 0,
  r: 0,
  bdrad: '4px',
  trs: 'background 0.1s ease',
  cur: 'pointer',
});

export const Thumb: React.FC<ScrollAreaThumbProps> = ({children, className, style, ...rest}) => {
  const state = useScrollArea();
  const theme = useTheme();
  const scrollRatio = useSyncStore(state.scrollRatio$);
  const thumbRatio = useSyncStore(state.thumbRatio$);
  const canScroll = useSyncStore(state.canScroll$);
  const railEl = state.railEl;
  const railHeight = railEl ? railEl.clientHeight : 0;
  const thumbH = state.thumbHeight(railHeight);
  const thumbT = state.thumbTop(railHeight);

  const ref = React.useCallback(
    (el: HTMLDivElement | null) => {
      state.setThumb(el);
    },
    [state],
  );

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      state.onThumbPointerDown(e.clientY);
      e.stopPropagation();
    },
    [state],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      state.onThumbPointerMove(e.clientY);
    },
    [state],
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      state.onThumbPointerUp();
    },
    [state],
  );

  if (!canScroll) return null;

  const computedStyle: React.CSSProperties = {
    height: thumbH,
    transform: `translate3d(0, ${thumbT}px, 0)`,
    background: theme.isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.35)',
    ...style,
  };

  if (typeof children === 'function') {
    return (
      <div
        ref={ref}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {children({style: computedStyle, thumbRatio})}
      </div>
    );
  }

  return (
    <div
      {...rest}
      ref={ref}
      className={thumbClass + (className ? ' ' + className : '')}
      style={computedStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
};
