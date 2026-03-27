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
  t: '-8px',
  l: '-72px',
});

// const topRightOverlay = rule({
//   d: 'block',
//   pos: 'absolute',
//   t: '-36px',
//   r: '-16px',
// });

const gap = 4;
const position: EntangledPortalStateOpts['position'] = (base, dest) => {
  let x = base.x - (dest.width >> 1);
  let y = base.y;
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
  if (base.y + dest.height + scrollY > pageHeight) y = base.y - (base.y + dest.height + scrollY - pageHeight);
  return [x, y];
};

export interface LeafBlockProps extends RenderBlockProps {}

export const LeafBlock: React.FC<LeafBlockProps> = ({block, children}) => {
  const state = useEditor();
  const activeLeafBlockId = useSyncStore(state.activeLeafBlockId$);
  const isBlockActive = !!activeLeafBlockId && compare(activeLeafBlockId, block.marker?.id ?? block.txt.str.id) === 0;
  const menu = React.useMemo(() => isBlockActive ? state.menu.block.buildLeafMenu({leaf: block}) : undefined, [state, block.hash, isBlockActive]);

  return (
    <div className={blockClass}>
      {children}
      {!!menu && (
        <div className={topLeftOverlay}>
          <EntangledPortal position={position}>
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
