import * as React from 'react';
import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import type { PaneProps } from '../types';

export const Pane = forwardRef<HTMLDivElement, PaneProps>(
  function Pane(props, ref) {
    const {
      style,
      children,
      // These props are extracted but used by parent SplitPane
      defaultSize: _defaultSize,
      size: _size,
      minSize: _minSize,
      maxSize: _maxSize,
      ...rest
    } = props;

    const defaultStyle: CSSProperties = {
      position: 'relative',
      outline: 'none',
      overflow: 'auto',
      flex: 'none',
    };

    const combinedStyle: CSSProperties = {
      ...defaultStyle,
      ...style,
    };

    return (
      <div
        ref={ref}
        style={combinedStyle}
        data-pane="true"
        {...rest}
      >
        {children}
      </div>
    );
  }
);
