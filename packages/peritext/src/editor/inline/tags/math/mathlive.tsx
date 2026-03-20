import * as React from 'react';
import {rule} from 'nano-theme';

// TODO: load these once?
// or: https://cdn.jsdelivr.net/npm/mathlive@0.109.0/mathlive-static.css
import 'mathlive';
import 'mathlive/fonts.css';
import 'mathlive/static.css';

const equationSelectedClass = rule({
  '&::part(render)': {
    bg: 'var(--selection-color)',
    bdrad: '2px',
  },
});

export interface MathSpanProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  tex: string;
  mode?: 'display' | 'textstyle' | 'scriptstyle' | 'scriptscriptstyle';
  selected?: boolean;
}

export const MathSpan: React.FC<MathSpanProps> = ({tex, mode = 'textstyle', selected, ...props}) => {
  const ref = React.useRef<HTMLInputElement>(null);

  if (ref.current && ref.current.textContent !== tex) {
    ref.current.textContent = tex;
    try {(ref.current as any).render?.();} catch {}
  }

  return React.createElement('math-span', {...props, ref, mode, className: selected ? equationSelectedClass : ''}, tex);
};
