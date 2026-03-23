import * as React from 'react';
import {rule} from 'nano-theme';
import type {ScrollAreaMarkerProps} from './types';

const markerClass = rule({
  pos: 'absolute',
  l: '2px',
  r: '2px',
});

export const Marker: React.FC<ScrollAreaMarkerProps> = ({
  position,
  color = 'currentColor',
  height: markerHeight = 2,
  onClick,
  children,
  className,
  style,
  ...rest
}) => {
  const computedStyle: React.CSSProperties = {
    top: `${Math.max(0, Math.min(1, position)) * 100}%`,
    height: markerHeight,
    pointerEvents: onClick ? 'auto' : 'none',
    background: children ? undefined : color,
    ...style,
  };

  if (typeof children === 'function') {
    return <>{children(computedStyle)}</>;
  }

  return (
    <div
      {...rest}
      className={markerClass + (className ? ' ' + className : '')}
      style={computedStyle}
      onClick={onClick}
    />
  );
};
