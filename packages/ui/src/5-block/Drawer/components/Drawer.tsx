import * as React from 'react';
import {DrawerState} from '../state';
import {ctx} from '../context';
import type {DrawerSide, DrawerMode, CloseSource} from '../types';
import {DrawerControlled} from './DrawerControlled';

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

export const Drawer: React.FC<DrawerProps> = ({state: _state, onOpenChange, defaultOpen, ...rest}) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies : custom deps management
  const state = React.useMemo(() => {
    if (_state) return _state;
    return new DrawerState({
      open: defaultOpen ?? false,
      side: rest.side,
      width: typeof rest.width === 'number' ? rest.width : 260,
    });
  }, [_state, rest.side]);
  const open = state.open$.use();
  const width = state.width$.use();
  const side = state.side$.use();
  const handleOpenChange = React.useCallback(
    (next: boolean, source?: CloseSource) => {
      state.open$.next(next);
      onOpenChange?.(next, source);
    },
    [state, onOpenChange],
  );

  return (
    <ctx.Provider value={state}>
      <DrawerControlled {...rest} side={side} width={width} open={open} onOpenChange={handleOpenChange} />
    </ctx.Provider>
  );
};
