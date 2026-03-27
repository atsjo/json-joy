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
  const show = selection.show.use();
  const toolbarState = selection.toolbar.use();
  const newSlice = selection.newSlice.use();
  const enableAfterCoolDown = useTimeout(300, [selection.showTime]);
  const isScrubbing = useSyncStoreOpt(surface.dom?.cursor.mouseDown) || false;

  const handleClose = React.useCallback(() => {
    //   surface.dom?.focus();
    //   // if (showInlineToolbar.value) showInlineToolbar.next(false);
  }, []);

  if (newSlice || !show || isScrubbing || state.txt.editor.mainCursor() !== cursor || !toolbarState) {
    return;
  }

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
