import * as React from 'react';
import useMedia from 'react-use/lib/useMedia';
import {InlineDrawer} from './InlineDrawer';
import {OverlayDrawer} from './OverlayDrawer';
import type {DrawerSide, DrawerMode, CloseSource} from '../types';

export interface DrawerControlledProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
  onOpenChange?: (open: boolean, source?: CloseSource) => void;
  side?: DrawerSide;
  width?: number | string;
  separator?: boolean;
  type?: DrawerMode;
  overlayBreakpoint?: string;
  modalType?: 'modal' | 'non-modal';
  backdrop?: boolean;
  preventClose?: boolean;
  mountNode?: HTMLElement | null;
}

const DEFAULT_BREAKPOINT = '(max-width: 768px)';

export const DrawerControlled: React.FC<DrawerControlledProps> = ({
  open = true,
  onOpenChange,
  side = 'left',
  width = 260,
  separator = true,
  type = 'auto',
  overlayBreakpoint = DEFAULT_BREAKPOINT,
  modalType,
  backdrop,
  preventClose,
  mountNode,
  children,
  ...rest
}) => {
  const isSmall = useMedia(overlayBreakpoint);
  const overlay = type === 'overlay' || (type === 'auto' && isSmall);

  if (overlay) {
    return (
      <OverlayDrawer
        {...rest}
        open={open}
        onOpenChange={onOpenChange}
        side={side}
        width={width}
        modalType={modalType}
        backdrop={backdrop}
        preventClose={preventClose}
        mountNode={mountNode}
      >
        {children}
      </OverlayDrawer>
    );
  }

  return (
    <InlineDrawer {...rest} open={open} side={side} width={width} separator={separator} onOpenChange={onOpenChange}>
      {children}
    </InlineDrawer>
  );
};
