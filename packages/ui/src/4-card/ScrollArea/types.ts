import type * as React from 'react';

export interface ScrollAreaViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ScrollAreaMarkerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Position in document as fraction 0..1. */
  position: number;
  /** Marker color (simple mode). */
  color?: string;
  /** Marker height in px (simple mode). */
  height?: number;
  /** If provided, marker intercepts clicks. */
  onClick?: () => void;
  /** Render prop for full custom rendering. */
  children?: (style: React.CSSProperties) => React.ReactNode;
}

export interface ScrollAreaHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ScrollAreaFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ScrollStateOpts {
  railWidth?: number;
  minThumbSize?: number;
  hideDelay?: number;
  alwaysVisible?: boolean;
}
