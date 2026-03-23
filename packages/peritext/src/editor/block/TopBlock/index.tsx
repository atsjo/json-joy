import * as React from 'react';
import {rule} from 'nano-theme';
import {createElement as h} from 'react';
import { SplitPane, Pane } from 'react-split-pane';
import {DragDivider, WIDTH as DIVIDER_WIDTH} from './DragDivider';
import type {RenderBlockProps} from '../RenderBlock';

const blockClass = rule({});

export interface TopBlockProps extends RenderBlockProps {}

export const TopBlock: React.FC<TopBlockProps> = ({children}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const divider = el.querySelector('.split-pane-divider') as HTMLDivElement | null;
    console.log('divider', divider);
    if (divider) {
      divider.contentEditable = 'false';
    }
  }, []);

  return (
    <div className={blockClass} ref={ref}>
      <SplitPane direction="horizontal" dividerSize={DIVIDER_WIDTH} divider={DragDivider}>
        {h(Pane, {minSize: 200, defaultSize: '75%'} as any, children)}
        {h(Pane, {contentEditable: false, minSize: 200} as any, "aside margin")}
      </SplitPane>
    </div>
  );
};
