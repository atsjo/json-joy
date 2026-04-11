import * as React from 'react';
import {DrawerState} from '../state';
import {useMediaQuery} from '../hooks/useMediaQuery';
import {InlineDrawer} from './InlineDrawer';
import {OverlayDrawer} from './OverlayDrawer';
import type {DrawerSide, DrawerMode, CloseSource} from '../types';

export interface DrawerProps extends React.HTMLAttributes<HTMLElement> {
  state?: DrawerState;
  open?: boolean;
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
  open,
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
      open: open ?? defaultOpen ?? false,
      side,
      width: typeof width === 'number' ? width : 260,
    });
  }, [_state]);

  React.useLayoutEffect(() => {
    if (_state) return;
    if (open !== undefined) state.open$.next(open);
  }, [open, _state, state]);

  const isSmall = useMediaQuery(overlayBreakpoint);
  const useOverlay = type === 'overlay' || (type === 'auto' && isSmall);
  const isOpen = state.open$.use();

  const handleOpenChange = React.useCallback(
    (next: boolean, source?: CloseSource) => {
      state.open$.next(next);
      onOpenChange?.(next, source);
    },
    [state, onOpenChange],
  );

  if (useOverlay) {
    return (
      <OverlayDrawer
        {...rest}
        state={state}
        open={isOpen}
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
      open={isOpen}
      side={side}
      width={width}
      separator={separator}
      onOpenChange={(next) => handleOpenChange(next, 'programmatic')}
    >
      {children}
    </InlineDrawer>
  );
};
