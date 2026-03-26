import * as React from 'react';
import {useEditor} from '../../state/context';
import {CaretFrame} from '../util/CaretFrame';
import {FmtNewPane} from '../../inline/components/FmtNewPane';
import {BottomPanePortal} from '../util/BottomPanePortal';
import {useSyncStore, useSyncStoreOpt} from '../../../web/react/hooks';
import type {CaretViewProps} from '../../../web/react/cursor/CaretView';
import {FocusOver} from './FocusOver';

export interface RenderFocusProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderFocus: React.FC<RenderFocusProps> = (props) => {
  const {children, cursor} = props;
  const state = useEditor()!;
  const {surface, selection} = state;
  const showInlineToolbarValue = selection.show.use();
  const isScrubbing = useSyncStoreOpt(surface.dom?.cursor.mouseDown) || false;
  const formatting = useSyncStore(state.newSlice);

  let under: React.ReactNode | undefined;

  if (!!formatting && showInlineToolbarValue && !isScrubbing && state.txt.editor.mainCursor() === cursor) {
    under = (
      <BottomPanePortal>
        <FmtNewPane formatting={formatting} onSave={() => formatting.save()} />
      </BottomPanePortal>
    );
  }

  return (
    <CaretFrame over={<FocusOver {...props} />} under={under}>
      {children}
    </CaretFrame>
  );
};
