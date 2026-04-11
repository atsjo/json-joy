import * as React from 'react';
import {rule, makeRule} from 'nano-theme';
import {DrawerState} from '../state';
import {ctx} from '../context';
import type {DrawerSide} from '../types';

const blockClass = rule({
  pos: 'relative',
  flexShrink: 0,
  h: '100%',
  minW: 0,
  bxz: 'border-box',
  ov: 'hidden',
  trs: 'width 220ms cubic-bezier(.22,1,.36,1)',
});

const innerClass = rule({
  d: 'flex',
  flexDirection: 'column',
  h: '100%',
  minW: 0,
  bxz: 'border-box',
});

const useBlockClass = makeRule((theme) => ({
  bg: theme.bg,
}));

const useSeparatorClass = makeRule((theme) => ({
  borderColor: theme.g(0, 0.08),
}));

const leftSeparatorClass = rule({
  bdr: '1px solid transparent',
});

const rightSeparatorClass = rule({
  bdl: '1px solid transparent',
});

export interface InlineDrawerProps extends React.HTMLAttributes<HTMLElement> {
  state?: DrawerState;
  open?: boolean;
  defaultOpen?: boolean;
  side?: DrawerSide;
  width?: number | string;
  separator?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const InlineDrawer: React.FC<InlineDrawerProps> = ({
  state: _state,
  open,
  defaultOpen,
  side = 'left',
  width = 260,
  separator = true,
  onOpenChange,
  children,
  className,
  style,
  ...rest
}) => {
  const state = React.useMemo(() => {
    if (_state) return _state;
    return new DrawerState({open: open ?? defaultOpen ?? true, side, width: typeof width === 'number' ? width : 260});
  }, [_state]);

  React.useLayoutEffect(() => {
    if (_state) return;
    if (open !== undefined) state.open$.next(open);
  }, [open, _state, state]);

  React.useLayoutEffect(() => {
    state.side$.next(side);
  }, [side, state]);

  React.useLayoutEffect(() => {
    if (typeof width === 'number') state.width$.next(width);
  }, [width, state]);

  React.useEffect(() => {
    if (!onOpenChange) return;
    return state.open$.subscribe(() => {
      onOpenChange(state.open$.value);
    });
  }, [onOpenChange, state]);

  const isOpen = state.open$.use();
  const w = state.width$.use();
  const dynamicClass = useBlockClass();
  const dynamicSeparatorClass = useSeparatorClass();

  const resolvedWidth = typeof width === 'string' ? width : `${w}px`;

  return (
    <ctx.Provider value={state}>
      <aside
        {...rest}
        role="navigation"
        data-state={isOpen ? 'open' : 'closed'}
        data-side={side}
        className={
          blockClass +
          dynamicClass +
          (separator ? dynamicSeparatorClass + (side === 'right' ? rightSeparatorClass : leftSeparatorClass) : '') +
          (className ? ' ' + className : '')
        }
        style={{
          width: isOpen ? resolvedWidth : 0,
          ...style,
        }}
      >
        <div className={innerClass} style={{width: '100%'}}>
          {children}
        </div>
      </aside>
    </ctx.Provider>
  );
};
