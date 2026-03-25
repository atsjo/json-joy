import * as React from 'react';
import {keyframes, rule} from 'nano-theme';
import useHarmonicIntervalFn from 'react-use/lib/useHarmonicIntervalFn';
import {CommonSliceType} from 'json-joy/lib/json-crdt-extensions';
import {Anchor} from 'json-joy/lib/json-crdt-extensions/peritext/rga/constants';
import {usePeritext} from '../../web/react/context';
import {useSyncStore, useSyncStoreOpt} from '../../web/react/hooks';
import {CursorConstants} from './constants';
import {CaretScore} from './CaretScore';
import type {CaretViewProps} from '../../web/react/cursor/CaretView';

const ms = 350;

const moveAnimation = keyframes({
  from: {
    tr: 'scale(1.2)',
  },
  to: {
    tr: 'scale(1)',
  },
});

const blockClass = rule({
  pos: 'relative',
  pe: 'none',
  us: 'none',
  w: '0px',
  h: '100%',
  bg: 'black',
  va: 'baseline',
});

const innerClass = rule({
  pos: 'absolute',
  b: 'calc(var(--' + CursorConstants.CaretHeight + ') / -2 + 0.5em)',
  l: '-.065em',
  w: 'calc(max(.2em, 2px))',
  h: `var(--${CursorConstants.CaretHeight})`,
  bg: 'var(--caret-color)',
  bdl: `1px dotted var(--${CursorConstants.CaretColorBlurred})`,
  bdrad: '0.0625em',
  an: moveAnimation + ' .25s ease-out forwards',
});

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = ({italic, point, bwd, fwd, children}) => {
  const ctx = usePeritext();
  const pending = useSyncStore(ctx.peritext.editor.pending);
  const [show, setShow] = React.useState(true);
  useHarmonicIntervalFn(() => setShow(Date.now() % (ms + ms) > ms), ms);
  const {dom} = usePeritext();
  const focus = useSyncStoreOpt(dom?.cursor.focus) || false;
  const ref = React.useRef<HTMLSpanElement>(null);

  // Place caret at the end of line wrap.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const style = el.style;
    style.top = '0px';
    style.left = '0px';
    if (point.anchor === Anchor.After) {
      if (point.isAbs()) return;
      const rect = ctx.dom.getCharRect(point.id);
      if (!rect) return;
      const nextPoint = point.copy((p) => p.refBefore());
      if (nextPoint.isAbs()) return;
      const rect2 = ctx.dom.getCharRect(nextPoint.id);
      if (!rect2) return;
      if (rect.x > rect2.x) {
        const dx = rect.x + rect.width - rect2.x;
        const dy = rect.y - rect2.y;
        style.top = dy + 'px';
        style.left = dx + 'px';
      }
    }
  }, [point, ctx.dom.getCharRect]);
  const inline = fwd || bwd;

  let isSmall = false;
  let isSup = false;
  let isSub = false;
  if (inline) {
    const attr = inline?.attr();
    isSup ||= !!attr[CommonSliceType.sup];
    isSub ||= !!attr[CommonSliceType.sub];
    isSmall ||= isSup || isSub;
  }

  const anchorForward = point.anchor === Anchor.Before;

  const style: React.CSSProperties = {
    background: !focus
      ? `var(--${CursorConstants.CaretColorBlurred})`
      : show
        ? `var(--${CursorConstants.CaretColor})`
        : 'transparent',
  };

  if (isSmall) {
    style.width = 'calc(max(.15em, 2px))';
    style.height = `calc(var(--${CursorConstants.CaretHeight}) / 2)`;
    if (isSup) {
      style.bottom = 'calc(var(--' + CursorConstants.CaretHeight + ') / -2 + 1.25em)';
    } else {
      style.bottom = 'calc(var(--' + CursorConstants.CaretHeight + ') / -4 + 0.25em)';
    }
  }

  if (italic || pending?.has(CommonSliceType.i)) {
    style.rotate = '11deg';
  }

  if (anchorForward) {
    style.borderLeft = 0;
    style.borderRight = `1px dotted var(--${CursorConstants.CaretColorBlurred})`;
  }

  return (
    <span ref={ref} className={blockClass}>
      {children}
      <CaretScore />
      <span className={innerClass} style={style} />
    </span>
  );
};
