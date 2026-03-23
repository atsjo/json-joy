import * as React from 'react';
import {rule} from 'nano-theme';
import {cn} from '../utils/classNames';
import type {DividerProps} from '../types';
import type {CSSProperties} from 'react';

export const WIDTH = 10;
const PADDING = 3;

const blockClass = rule({
  w: WIDTH + 'px',
  d: 'flex',
  ai: 'center',
  jc: 'center',
  bxz: 'border-box',
  us: 'none',
  '&:focus': {
    out: 'none',
  },
});

const handleClass = rule({
  w: (WIDTH - PADDING - PADDING) + 'px',
  h: 'calc(100% - 2px)',
  bxz: 'border-box',
  trs: 'background .3s, width .1s, height .1s',
  bdrad: '2px',
  [`.${blockClass.trim()}:hover &`]: {
    bg: 'rgba(127,127,127,.1)',
  },
  [`.${blockClass.trim()}:focus &`]: {
    w: (WIDTH - PADDING - PADDING - 2) + 'px',
    h: 'calc(100% - 6px)',
    bg: 'var(--caret-color)',
  },
  [`.${blockClass.trim()}:active &`]: {
    w: (WIDTH - PADDING - PADDING - 2) + 'px',
    h: 'calc(100% - 6px)',
    bg: 'var(--caret-color)',
  },
});

export const Divider: React.FC<DividerProps> = (props: DividerProps) => {
  const {
    direction,
    index,
    isDragging,
    disabled,
    onPointerDown,
    onKeyDown,
    className,
    style,
    currentSize,
    minSize,
    maxSize,
  } = props;

  const orientation = direction === 'horizontal' ? 'vertical' : 'horizontal';

  const defaultStyle: CSSProperties = {
    flex: 'none',
    position: 'relative',
    userSelect: 'none',
    touchAction: 'none',
    ...(direction === 'horizontal'
      ? {
          width: '1px',
          cursor: disabled ? 'default' : 'col-resize',
        }
      : {
          height: '1px',
          cursor: disabled ? 'default' : 'row-resize',
        }),
    ...(isDragging && {
      cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
    }),
  };

  const combinedStyle: CSSProperties = {
    ...defaultStyle,
    ...style,
    width: '10px',
  };

  const combinedClassName = cn(
    blockClass,
    direction,
    isDragging && 'dragging',
    className
  );

  const label = `${orientation} divider ${index + 1}`;
  const instructions = 'Use arrow keys to resize. Hold Shift for larger steps. Press Home or End to minimize or maximize.';

  // Don't pass Infinity to ARIA attributes - screen readers can't handle it
  const ariaValueMax =
    maxSize === undefined || maxSize === Infinity ? undefined : maxSize;

  return (
    <div
      contentEditable={false}
      className={combinedClassName}
      role="separator"
      aria-orientation={orientation}
      aria-label={label}
      aria-valuenow={currentSize}
      aria-valuemin={minSize}
      aria-valuemax={ariaValueMax}
      aria-description={instructions}
      tabIndex={disabled ? -1 : 0}
      style={combinedStyle}
      onPointerDown={disabled ? undefined : onPointerDown}
      onKeyDown={disabled ? undefined : onKeyDown}
      data-divider-index={index}
    >
      <div className={handleClass} contentEditable={false} />
    </div>
  );
};
