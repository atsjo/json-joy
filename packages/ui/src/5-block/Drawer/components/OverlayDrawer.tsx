import * as React from 'react';
import {rule, makeRule} from 'nano-theme';
import {Portal} from '../../../utils/portal/Portal';
import {useLockScrolling} from '../../../hooks/useLockScrolling';
import {useFocusTrap} from '../hooks/useFocusTrap';
import {DrawerState} from '../state';
import {ctx} from '../context';
import type {DrawerSide, CloseSource} from '../types';

const PANEL_INSET = '1px';
const PANEL_RADIUS = '18px';

const backdropClass = rule({
  pos: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  z: 999,
  trs: 'opacity 200ms ease',
});

const useBackdropClass = makeRule((theme) => ({
  bg: theme.isLight ? 'rgba(241,245,249,.46)' : 'rgba(2,6,23,.42)',
  bdfl: 'saturate(180%) blur(14px)',
}));

const panelClass = rule({
  pos: 'fixed',
  top: PANEL_INSET,
  bottom: PANEL_INSET,
  d: 'flex',
  flexDirection: 'column',
  bxz: 'border-box',
  z: 1000,
  ov: 'hidden',
  out: 0,
  op: 0,
  trs: 'transform 250ms cubic-bezier(.22,1,.36,1), opacity 180ms ease, visibility 0ms linear 250ms',
  vis: 'hidden',
  willChange: 'transform',
  '&:focus': {
    out: 0,
  },
  '&:focus-visible': {
    out: 0,
  },
});

const panelOpenClass = rule({
  transform: 'translateX(0)',
  op: 1,
  trs: 'transform 250ms cubic-bezier(.22,1,.36,1), opacity 180ms ease',
  vis: 'visible',
});

const usePanelClass = makeRule((theme) => ({
  bg: theme.isLight ? 'rgba(255,255,255,.92)' : 'rgba(19,24,32,.92)',
  bd: `1px solid ${theme.isLight ? 'rgba(15,23,42,.08)' : 'rgba(255,255,255,.08)'}`,
  bdfl: 'saturate(180%) blur(18px)',
  bxsh: theme.isLight
    ? '0 1px 2px rgba(15,23,42,.05), 0 16px 42px rgba(15,23,42,.16), 0 4px 14px rgba(15,23,42,.08)'
    : '0 0 0 1px rgba(255,255,255,.04), 0 18px 44px rgba(0,0,0,.48), 0 4px 14px rgba(0,0,0,.28)',
}));

const leftPanelShapeClass = rule({
  bdrad: `0 ${PANEL_RADIUS} ${PANEL_RADIUS} 0`,
});

const rightPanelShapeClass = rule({
  bdrad: `${PANEL_RADIUS} 0 0 ${PANEL_RADIUS}`,
});

const leftClosedClass = rule({
  transform: 'translateX(-110%)',
  left: PANEL_INSET,
});

const rightClosedClass = rule({
  transform: 'translateX(110%)',
  right: PANEL_INSET,
});

const leftOpenClass = rule({
  left: PANEL_INSET,
});

const rightOpenClass = rule({
  right: PANEL_INSET,
});

export interface OverlayDrawerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  state?: DrawerState;
  open: boolean;
  onOpenChange: (open: boolean, source: CloseSource) => void;
  side?: DrawerSide;
  width?: number | string;
  modalType?: 'modal' | 'non-modal';
  backdrop?: boolean;
  preventClose?: boolean;
  mountNode?: HTMLElement | null;
  children?: React.ReactNode;
}

export const OverlayDrawer: React.FC<OverlayDrawerProps> = ({
  state: _state,
  open,
  onOpenChange,
  side = 'left',
  width = 320,
  modalType = 'modal',
  backdrop = modalType === 'modal',
  preventClose,
  mountNode,
  children,
  className,
  style,
  ...rest
}) => {
  const panelRef = React.useRef<HTMLDivElement>(null);

  const state = React.useMemo(() => {
    if (_state) return _state;
    return new DrawerState({open, side, width: typeof width === 'number' ? width : 320});
  }, [_state]);

  React.useLayoutEffect(() => {
    state.open$.next(open);
  }, [open, state]);

  const isOpen = state.open$.use();
  const dynamicBackdropClass = useBackdropClass();
  const dynamicPanelClass = usePanelClass();

  useLockScrolling(isOpen && modalType === 'modal');
  useFocusTrap(panelRef, isOpen && modalType === 'modal');

  React.useEffect(() => {
    if (!isOpen || preventClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onOpenChange(false, 'escape');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, preventClose, onOpenChange]);

  const onBackdropClick = React.useCallback(() => {
    if (!preventClose) onOpenChange(false, 'backdrop');
  }, [preventClose, onOpenChange]);

  const isLeft = side === 'left';
  const resolvedWidth = typeof width === 'number' ? `${width}px` : width;

  const panel = (
    <div
      {...rest}
      ref={panelRef}
      role="dialog"
      aria-modal={modalType === 'modal' ? true : undefined}
      data-state={isOpen ? 'open' : 'closed'}
      data-side={side}
      tabIndex={-1}
      className={
        panelClass +
        dynamicPanelClass +
        (isLeft ? leftPanelShapeClass : rightPanelShapeClass) +
        (isOpen ? panelOpenClass : '') +
        (isLeft
          ? isOpen ? leftOpenClass : leftClosedClass
          : isOpen ? rightOpenClass : rightClosedClass) +
        (className ? ' ' + className : '')
      }
      style={{
        width: resolvedWidth,
        maxWidth: 'calc(100vw - 2px)',
        ...style,
      }}
    >
      {children}
    </div>
  );

  if (!isOpen && !panelRef.current) return null;

  const content = (
    <ctx.Provider value={state}>
      {backdrop && isOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handled separately
        <div className={backdropClass + dynamicBackdropClass} onClick={onBackdropClick} aria-hidden="true" />
      )}
      {panel}
    </ctx.Provider>
  );

  return <Portal parent={mountNode ?? undefined}>{content}</Portal>;
};
