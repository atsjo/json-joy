import * as React from 'react';
import {CaretToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {useEditor} from '../../state/context';
import {TopPanePortal} from '../util/TopPanePortal';
import {useSyncStore, useSyncStoreOpt, useTimeout} from '../../../web/react/hooks';
import type {CaretViewProps} from '../../../web/react/cursor/CaretView';

export interface FocusOverProps extends CaretViewProps {}

export const FocusOver: React.FC<FocusOverProps> = ({cursor}) => {
  const state = useEditor()!;
  const {surface, selection} = state;
  const showInlineToolbarValue = selection.show.use();
  const enableAfterCoolDown = useTimeout(300, [selection.showTime]);
  const isScrubbing = useSyncStoreOpt(surface.dom?.cursor.mouseDown) || false;
  const formatting = useSyncStore(state.newSlice);
  const overToolbarState = selection.toolbar.use();

  const handleClose = React.useCallback(() => {
    //   surface.dom?.focus();
    //   // if (showInlineToolbar.value) showInlineToolbar.next(false);
  }, []);

  if (formatting || !showInlineToolbarValue || isScrubbing || state.txt.editor.mainCursor() !== cursor || !overToolbarState) {
    return;
  }

  return (
    <TopPanePortal>
      <CaretToolbar
        state={overToolbarState}
        disabled={!enableAfterCoolDown /* || (!focus && blurTimeout) */}
        more={{
          small: true,
        }}
        menu={state.menu.range.build()}
        onPopupClose={handleClose}
      />
    </TopPanePortal>
  );
};
