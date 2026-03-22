import * as React from 'react';
import {rule} from 'nano-theme';
import type {InlineAttrStack} from 'json-joy/lib/json-crdt-extensions';

const col = '#05f';

const blockClass = rule({
  col,
  td: 'underline',
  textDecorationColor: col,
  textDecorationThickness: '1px',
  textDecorationStyle: 'wavy',
  textUnderlineOffset: '.25em',
  // textDecorationSkipInk: 'all',

  '&:hover': {
    col: col,
  },
  pd: 0,
  mr: 0,

  // Needed temporarily, to reset nano-theme styles
  bdb: 'none',
  'p &': {
    bdb: 'none',
    '&:hover': {
      bdb: 'none',
    },
  },
});

export interface SpanProps {
  children: React.ReactNode;
  attr: InlineAttrStack;
}

export const Span: React.FC<SpanProps> = (props) => {
  const {children, attr} = props;
  const layers = attr.length;
  const style: React.CSSProperties | undefined =
    layers < 2
      ? void 0
      : {
          textDecorationThickness: Math.max(Math.min(0.5 + layers * 0.5, 3), 1) + 'px',
        };

  return (
    <span className={blockClass} style={style} title={(attr[0].slice.data() as {title?: string})?.title}>
      {children}
    </span>
  );
};
