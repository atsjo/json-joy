import * as React from 'react';
import {rule} from 'nano-theme';
import {useSyncStore} from '@jsonjoy.com/ui/lib/hooks/useSyncStore';
import {useEditor} from '../../state/context';
import {AutoExpandableToolbar} from './AutoExpandableToolbar';
import {compare} from 'json-joy/lib/json-crdt-patch';
import {EntangledPortal, type EntangledPortalStateOpts} from '../../components/EntangledPortal';
import type {RenderBlockProps} from '../RenderBlock';

const blockClass = rule({
  d: 'block',
  pos: 'relative',
  pd: '1em 0',
});

const topLeftOverlay = rule({
  d: 'block',
  pos: 'absolute',
  t: '16px',
  l: '-72px',
});

// const topRightOverlay = rule({
//   d: 'block',
//   pos: 'absolute',
//   t: '-36px',
//   r: '-16px',
// });

const gap = 4;

export interface LeafBlockProps extends RenderBlockProps {}

export const LeafBlock: React.FC<LeafBlockProps> = ({block, children}) => {
  const state = useEditor();

  const repositionRef = React.useRef<(() => void) | undefined>(void 0);

  React.useEffect(() => {
    return state.et.subscribe('cursor', () => {
      setTimeout(() => {
        repositionRef.current?.();
      }, 25);
    });
  }, [state]);

  const position = React.useCallback<NonNullable<EntangledPortalStateOpts['position']>>(
    (base, dest) => {
      let x = base.x - (dest.width >> 1) + 24;
      const caretRect = state.surface.dom.caretRect();
      let y = caretRect ? caretRect.y - 10 : base.y;
      if (x < gap) x = gap;
      else if (x + dest.width + gap > window.innerWidth) x = window.innerWidth - dest.width - gap;
      const {scrollY} = window;
      const body = document.body;
      const html = document.documentElement;
      const pageHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
      );
      if (y + dest.height + scrollY > pageHeight) y = y - (y + dest.height + scrollY - pageHeight);
      return [x, y];
    },
    [state],
  );
  const activeLeafBlockId = useSyncStore(state.activeLeafBlockId$);
  const isBlockActive = !!activeLeafBlockId && compare(activeLeafBlockId, block.marker?.id ?? block.txt.str.id) === 0;
  const menu = React.useMemo(
    () => (isBlockActive ? state.menu.block.buildLeafMenu({leaf: block}) : undefined),
    [state, block.hash, isBlockActive],
  );

  return (
    <div className={blockClass}>
      {children}
      {!!menu && (
        <div className={topLeftOverlay}>
          <EntangledPortal position={position} repositionRef={repositionRef}>
            <AutoExpandableToolbar menu={menu!} more={{small: true}} />
          </EntangledPortal>
        </div>
      )}
      {/* <div className={topRightOverlay}>
        <InlineToolbarMenu menu={menu!} />
      </div> */}
    </div>
  );
};
