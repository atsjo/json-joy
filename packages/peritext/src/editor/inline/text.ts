import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import type * as React from 'react';
import type {SpanProps} from '../../web/react/types';
import type {Inline, InlineAttrStack} from 'json-joy/lib/json-crdt-extensions/peritext/block/Inline';
import type {EditorState} from '../state';

export const text = (props: SpanProps, inline: Inline, state: EditorState): void => {
  const style = (props.style || (props.style = {})) as React.CSSProperties;
  const attrs = inline.attr();

  let textDecoration = '';
  let attr: InlineAttrStack | undefined;

  if (attrs[SliceTypeCon.b]) style.fontWeight = 'bold';
  if (attrs[SliceTypeCon.i]) style.fontStyle = 'italic';
  if (attrs[SliceTypeCon.u]) textDecoration = 'underline';
  if (attrs[SliceTypeCon.overline]) textDecoration = textDecoration ? textDecoration + ' overline' : 'overline';
  if (attrs[SliceTypeCon.s]) textDecoration = textDecoration ? textDecoration + ' line-through' : 'line-through';
  if ((attr = attrs[SliceTypeCon.col])) {
    const data = attr[attr.length - 1].slice.data();
    const color: string | undefined = typeof data === 'object' && data ? String((data as any).col) : void 0;
    if (color) style.color = color;
  }
  if ((attr = attrs[SliceTypeCon.bg])) {
    const data = attr[attr.length - 1].slice.data();
    const color: string | undefined = typeof data === 'object' && data ? String((data as any).col) : void 0;
    if (color) style.backgroundColor = color;
  }

  style.textDecoration = textDecoration;
};
