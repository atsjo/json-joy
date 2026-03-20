import * as React from 'react';
import {FmtManagePane} from '../../inline/FmtManagePane';
import {BottomPanePortal} from '../util/BottomPanePortal';
import {IslandProps} from './Island';
import {FmtManagePaneState} from '../../inline/FmtManagePane/state';

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
