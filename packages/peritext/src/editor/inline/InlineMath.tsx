import * as React from 'react';
import {Island} from '../cursor/island/Island';
import {IslandFrameProps} from '../cursor/island/IslandFrame';
import {rule} from 'nano-theme';
import type {Inline, InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import type {Slice} from 'json-joy/lib/json-crdt-extensions';

import 'mathlive';
// TODO: load these once?
// or: https://cdn.jsdelivr.net/npm/mathlive@0.109.0/mathlive-static.css
import 'mathlive/fonts.css';
import 'mathlive/static.css';

const equationClass = rule({
  cur: 'pointer',
  '& *': {
    cur: 'pointer',
  },
  '&::part(content)': {
    cur: 'pointer',
  },
});

const equationSelectedClass = rule({
  '&::part(render)': {
    bg: 'var(--selection-color)',
    bdrad: '2px',
  },
});

export interface InlineMathProps extends IslandFrameProps {
  inline: Inline;
  attr: InlineAttr;
  children: React.ReactNode;
}

export const InlineMath: React.FC<InlineMathProps> = ({inline, attr}) => {
  const ref = React.useRef<HTMLInputElement>(null);

  if (!attr.isStart()) return;

  const tex = (attr.slice as unknown as Slice<string>).text?.() ?? '';

  if (ref.current && ref.current.textContent !== tex) {
    ref.current.textContent = tex;
    try {(ref.current as any).render?.();} catch {}
  }

  return (
    <Island
      inline={inline}
      attr={attr}
      className={equationClass}
    >
      {React.createElement('math-span', {ref, mode: "textstyle", className: equationClass + (inline.isSelected() ? equationSelectedClass : '')}, tex)}
    </Island>
  );
};
