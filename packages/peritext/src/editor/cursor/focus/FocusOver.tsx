import * as React from 'react';
import {CaretToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {useEditor} from '../../state/context';
import {TopPanePortal} from '../util/TopPanePortal';
import {useSyncStoreOpt, useTimeout} from '../../../web/react/hooks';
import type {CaretViewProps} from '../../../web/react/cursor/CaretView';

export interface FocusOverProps extends CaretViewProps {}

export const FocusOver: React.FC<FocusOverProps> = ({cursor}) => {
  const state = useEditor()!;
  const {surface, selection} = state;
  const toolbarState = selection.toolbar.use();
  const enableAfterCoolDown = useTimeout(300, [selection.showTime]);
  const isScrubbing = useSyncStoreOpt(surface.dom?.cursor.mouseDown) || false;

  const handleClose = React.useCallback(() => {
    selection.toolbar.next(null);
  }, [selection.toolbar.next]);

  if (isScrubbing || !toolbarState || state.txt.editor.mainCursor() !== cursor) return;

  return (
    <TopPanePortal>
      <CaretToolbar
        state={toolbarState}
        disabled={!enableAfterCoolDown /* || (!focus && blurTimeout) */}
        more={{
          small: true,
          tooltip: {
            shortcut: '/',
          },
          // tooltip
        }}
        menu={state.menu.range.build()}
        onPopupClose={handleClose}
      />
    </TopPanePortal>
  );
};
