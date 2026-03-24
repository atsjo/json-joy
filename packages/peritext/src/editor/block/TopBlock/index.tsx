import * as React from 'react';
import {rule} from 'nano-theme';
import {SplitPane, Pane} from '@jsonjoy.com/ui/lib/5-block/SplitPane';
import type {RenderBlockProps} from '../RenderBlock';

const blockClass = rule({
  w: '100%',
  d: 'flex',
  ai: 'stretch',
});

const metaClass = rule({
  w: '40px',
  // bg: '#f0f0f0',
});

export interface TopBlockProps extends RenderBlockProps {}

/**
 * The main content track is managed by {@link TopBlock}, which consists of
 * the following rails:
 *
 * - Left gap: padding from sidebar or document left edge.
 * - Metadata rail: fixed size, for block-level metadata, such as block type, drag handle, etc.
 * - Content rail: main editable rich-text content.
 * - Divider: for resizing content/aside split.
 * - Aside/margin rail: for block-level annotations, such as comments, suggestions, asides, etc.
 * - Right gap: padding from sidebar or document right edge.
 */
export const TopBlock: React.FC<TopBlockProps> = ({children}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const divider = el.querySelector('.split-pane-divider') as HTMLDivElement | null;
    if (divider) {
      divider.contentEditable = 'false';
    }
  }, []);

  return (
    <div className={blockClass} ref={ref}>
      <div contentEditable={false} className={metaClass}>
        {' '}
      </div>
      <SplitPane direction="horizontal">
        <Pane minSize={200} defaultSize="75%">
          {children}
        </Pane>
        <Pane contentEditable={false} minSize={200}>
          {' '}
        </Pane>
      </SplitPane>
    </div>
  );
};
