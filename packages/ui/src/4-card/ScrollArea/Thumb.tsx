import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {useScrollArea} from './context';
import {useSyncStore} from '../../hooks/useSyncStore';

const MAX_BORDER_RADIUS = 4;

const thumbClass = rule({
  pos: 'absolute',
  l: 0,
  r: 0,
  bdrad: '4px',
  trs: 'background 0.1s ease',
  cur: 'pointer',
});

export interface ThumbProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: (props: {style: React.CSSProperties; thumbRatio: number}) => React.ReactNode;
}

export const Thumb: React.FC<ThumbProps> = ({children, className, style, ...rest}) => {
  const state = useScrollArea();
  const theme = useTheme();
  useSyncStore(state.scrollRatio$);
  const thumbRatio = useSyncStore(state.thumbRatio$);
  const canScroll = useSyncStore(state.canScroll$);
  const railEl = state.railEl;
  const railHeight = railEl ? railEl.clientHeight : 0;
  const thumbH = state.thumbHeight(railHeight);
  const thumbT = state.thumbTop(railHeight);

  if (!canScroll) return null;

  const topBorderRadius = Math.min(MAX_BORDER_RADIUS, thumbT / 3);
  const bottomBorderRadius = Math.min(MAX_BORDER_RADIUS, (railHeight - thumbT - thumbH) / 3);

  const computedStyle: React.CSSProperties = {
    height: thumbH,
    transform: `translate3d(0, ${thumbT}px, 0)`,
    background: theme.isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.35)',
    borderRadius: `${topBorderRadius}px ${topBorderRadius}px ${bottomBorderRadius}px ${bottomBorderRadius}px`,
    ...style,
  };

  if (typeof children === 'function') {
    return (
      <div
        ref={state.setThumb}
        onPointerDown={state.onThumbPointerDown}
        onPointerMove={state.onThumbPointerMove}
        onPointerUp={state.onThumbPointerUp}
      >
        {children({style: computedStyle, thumbRatio})}
      </div>
    );
  }

  return (
    <div
      {...rest}
      ref={state.setThumb}
      className={thumbClass + (className ? ' ' + className : '')}
      style={computedStyle}
      onPointerDown={state.onThumbPointerDown}
      onPointerMove={state.onThumbPointerMove}
      onPointerUp={state.onThumbPointerUp}
    />
  );
};
