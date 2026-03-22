import * as React from 'react';
import {FmtManagePane} from '../../inline/components/FmtManagePane';
import {BottomPanePortal} from '../util/BottomPanePortal';
import type {IslandProps} from './Island';
import type {FmtManagePaneState} from '../../inline/components/FmtManagePane/state';

export interface IslandUnderProps extends IslandProps {
  state: FmtManagePaneState;
}

export const IslandUnder: React.FC<IslandUnderProps> = (props) => {
  const {inline, state} = props;

  if (!inline) return;

  return (
    <BottomPanePortal>
      <FmtManagePane inline={inline} state={state} />
    </BottomPanePortal>
  );
};
