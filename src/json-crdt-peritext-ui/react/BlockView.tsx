import * as React from 'react';
import {LeafBlock} from '../../json-crdt-extensions/peritext/block/LeafBlock';
import type {Block} from '../../json-crdt-extensions/peritext/block/Block';
import {InlineView} from './InlineView';
import {Char} from '../constants';
import {usePeritext} from './context';
import {CommonSliceType} from '../../json-crdt-extensions';
import {CaretView} from './selection/CaretView';
import {FocusView} from './selection/FocusView';
import {InlineAttrEnd, InlineAttrStart} from '../../json-crdt-extensions/peritext/block/Inline';
import {AnchorView} from './selection/AnchorView';

export interface BlockViewProps {
  hash: number;
  block: Block;
  el?: (element: HTMLElement | null) => void;
}

export const BlockView: React.FC<BlockViewProps> = React.memo(
  (props) => {
    const {block, el} = props;
    const {renderers} = usePeritext();

    const elements: React.ReactNode[] = [];
    if (block instanceof LeafBlock) {
      for (const inline of block.texts()) {
        const hasCursor = inline.hasCursor();
        if (hasCursor) {
          const attr = inline.attr();
          const italic = attr[CommonSliceType.i] && attr[CommonSliceType.i][0];
          const cursorStart = inline.cursorStart();
          if (cursorStart) {
            const k = cursorStart.start.key() + '-a';
            let element: React.ReactNode;
            if (cursorStart.isStartFocused()) {
              element = cursorStart.isCollapsed() ? (
                <CaretView key={k + 'caret'} italic={!!italic} />
              ) : (
                <FocusView key={k} italic={italic instanceof InlineAttrEnd} />
              );
            } else element = <AnchorView key={k} />;
            elements.push(element);
          }
        }
        elements.push(<InlineView key={inline.key()} inline={inline} />);
        if (hasCursor) {
          const cursorEnd = inline.cursorEnd();
          const attr = inline.attr();
          const italic = attr[CommonSliceType.i] && attr[CommonSliceType.i][0];
          if (cursorEnd) {
            const k = cursorEnd.end.key() + '-b';
            elements.push(
              cursorEnd.isEndFocused() ? (
                cursorEnd.isCollapsed() ? (
                  <CaretView key={k} italic={!!italic} />
                ) : (
                  <FocusView key={k} left italic={italic instanceof InlineAttrStart} />
                )
              ) : (
                <AnchorView key={k} />
              ),
            );
          }
        }
      }
    } else {
      const children = block.children;
      const length = children.length;
      for (let i = 0; i < length; i++) {
        const child = children[i];
        elements.push(<BlockView key={child.key()} hash={child.hash} block={child} />);
      }
    }

    let children: React.ReactNode = (
      <div ref={(element) => el?.(element)}>{elements.length ? elements : Char.ZeroLengthSpace}</div>
    );
    for (const map of renderers) children = map.block?.(props, children) ?? children;
    return children;
  },
  (prev, next) => prev.hash === next.hash,
);
