import * as React from 'react';
import {Spoiler} from './Spoiler';
import {Code} from './Code';
import {Span as InlineMath} from './spans/math/components/Span';
import {Kbd} from './Kbd';
import {Ins} from './Ins';
import {Del} from './Del';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
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
    if (render) element = render(element, attr, props);
  }

  if (attrs[SliceTypeCon.mark]) element = <mark>{element}</mark>;
  if (attrs[SliceTypeCon.sup]) element = <sup>{element}</sup>;
  if (attrs[SliceTypeCon.sub]) element = <sub>{element}</sub>;
  if (attrs[SliceTypeCon.ins]) element = <Ins>{element}</Ins>;
  if (attrs[SliceTypeCon.del]) element = <Del>{element}</Del>;

  // TODO: for exclusive layers, only render one decoration.

  let layers = attrs[SliceTypeCon.code];
  if (layers) {
    const attr = layers[layers.length - 1];
    if (attr) element = <Code attr={attr}>{element}</Code>;
  }

  // TODO: Make atomic slice annotations exclusive.
  layers = attrs[SliceTypeCon.math];
  if (layers) {
    const attr = layers[layers.length - 1];
    if (attr)
      element = (
        <InlineMath inline={inline} attr={attr}>
          {element}
        </InlineMath>
      );
  }

  layers = attrs[SliceTypeCon.kbd];
  if (layers) {
    const attr = layers[layers.length - 1];
    if (attr) element = <Kbd attr={attr}>{element}</Kbd>;
  }
  layers = attrs[SliceTypeCon.spoiler];
  if (layers) {
    const attr = layers[layers.length - 1];
    if (attr) element = <Spoiler attr={attr}>{element}</Spoiler>;
  }
  return element;
};
