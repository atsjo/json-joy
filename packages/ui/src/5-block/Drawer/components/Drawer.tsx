import * as React from 'react';
import {DrawerState} from '../state';
import useMedia from 'react-use/lib/useMedia';
import {InlineDrawer} from './InlineDrawer';
import {OverlayDrawer} from './OverlayDrawer';
import type {DrawerSide, DrawerMode, CloseSource} from '../types';

export interface DrawerProps extends React.HTMLAttributes<HTMLElement> {
  state?: DrawerState;
  defaultOpen?: boolean;
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

export const Drawer: React.FC<DrawerProps> = ({
  state: _state,
  defaultOpen,
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
  const state = React.useMemo(() => {
    if (_state) return _state;
    return new DrawerState({
      open: defaultOpen ?? false,
      side,
      width: typeof width === 'number' ? width : 260,
    });
  }, [_state]);

  const isSmall = useMedia(overlayBreakpoint);
  const overlay = type === 'overlay' || (type === 'auto' && isSmall);
  const open = state.open$.use();

  const handleOpenChange = React.useCallback(
    (next: boolean, source?: CloseSource) => {
      state.open$.next(next);
      onOpenChange?.(next, source);
    },
    [state, onOpenChange],
  );

  if (overlay) {
    return (
      <OverlayDrawer
        {...rest}
        open={open}
        onOpenChange={handleOpenChange}
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
    <InlineDrawer
      {...rest}
      state={state}
      open={open}
      side={side}
      width={width}
      separator={separator}
      onOpenChange={(next) => handleOpenChange(next, 'programmatic')}
    >
      {children}
    </InlineDrawer>
  );
};
