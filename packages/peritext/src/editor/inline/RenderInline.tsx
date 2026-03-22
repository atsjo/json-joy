import * as React from 'react';
import {SliceStacking} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import {useEditor} from '../state';
import type {InlineViewProps} from '../../web/react/InlineView';

export interface RenderInlineProps extends InlineViewProps {
  children: React.ReactNode;
}

export const RenderInline: React.FC<RenderInlineProps> = (props) => {
  const editor = useEditor();
  const {inline, children} = props;
  const attrs = inline.attr();
  const tags = Object.keys(attrs);
  const length = tags.length;
  let element = children;
  if (length === 0) return element;
  const {spanMap, spanOrder} = editor;
  tags.sort((a, b) => (spanOrder[a] ?? 0) - (spanOrder[b] ?? 0));
  for (let i = 0; i < length; i++) {
    const behavior = spanMap[tags[i]];
    if (!behavior) continue;
    const attr = attrs[behavior.tag];
    if (!attr) continue;
    const render = behavior.render;
    if (render) {
      element = render(element, attr, props);
      if (behavior.stacking === SliceStacking.Atomic) break;
    }
  }
  return element;
};
