import * as React from 'react';
import {useT} from 'use-t';
import {ToolbarTextItem} from '../ToolbarTextItem';
import * as context from './context';
import type {BasicTooltipProps} from '../../BasicTooltip';

export interface ToolbarExpandBtnProps {
  small?: boolean;
  disabled?: boolean;
  tooltip?: BasicTooltipProps;
  onClick?: React.EventHandler<React.MouseEvent>;
}

export const ToolbarExpandBtn: React.FC<ToolbarExpandBtnProps> = ({small, disabled, tooltip, onClick}) => {
  const [t] = useT();
  const openPanel = context.useToolbarMenu()?.openPanel;

  return (
    <ToolbarTextItem
      small={small}
      disabled={disabled}
      onMouseEnter={() => openPanel?.onMouseMove('_expand')}
      onMouseMove={() => openPanel?.onMouseMove('_expand')}
      onMouseLeave={openPanel?.onMouseLeave}
      onClick={onClick}
      tooltip={
        small && !disabled
          ? {
              renderTooltip: () => t('More'),
              ...tooltip,
            }
          : tooltip
      }
    >
      {small ? void 0 : t('More')}
    </ToolbarTextItem>
  );
};
