import * as React from 'react';
import {Island} from '../cursor/island/Island';
import {IslandFrameProps} from '../cursor/island/IslandFrame';
import {MathSpan} from './tags/math/mathlive';
import {useSyncStoreOpt} from '@jsonjoy.com/ui/lib/hooks/useSyncStore';
import {useEditor} from '../context';
import type {Inline, InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import type {Slice} from 'json-joy/lib/json-crdt-extensions';

export interface InlineMathProps extends IslandFrameProps {
  inline: Inline;
  attr: InlineAttr;
  children: React.ReactNode;
}

export const InlineMath: React.FC<InlineMathProps> = ({inline, attr}) => {
  const editor = useEditor();
  const focused = useSyncStoreOpt(editor.surface.dom?.cursor.focus);

  if (!attr.isStart()) return;

  const tex = (attr.slice as unknown as Slice<string>).text?.() ?? '';

  return (
    <Island inline={inline} attr={attr}>
      <MathSpan tex={tex} mode={'textstyle'} focused={focused} selected={inline.isSelected()} />
    </Island>
  );
};
