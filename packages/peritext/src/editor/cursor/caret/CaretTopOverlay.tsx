import * as React from 'react';
import {CaretToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/CaretToolbar';
import {useEditor} from '../../state/context';
import {useTimeout} from '../../../web/react/hooks';
import {AfterTimeout} from '../../../web/react/util/AfterTimeout';
import type {CaretViewProps} from '../../../web/react/cursor/CaretView';

export interface CaretTopOverlayProps extends CaretViewProps {
  children: React.ReactNode;
}

export const CaretTopOverlay: React.FC<CaretTopOverlayProps> = () => {
  const state = useEditor()!;
  const selection = state.selection;
  const doHideForCoolDown = selection.showTime + 500 > Date.now();
  const enableAfterCoolDown = useTimeout(500, [doHideForCoolDown]);

  let element: React.ReactNode | undefined = (
    <CaretToolbar disabled={!enableAfterCoolDown} menu={state.menu.caret.build()} />
  );

  if (doHideForCoolDown) {
    element = <AfterTimeout ms={500}>{element}</AfterTimeout>;
  }

  element = null;

  return element;
};
