import * as React from 'react';
import {ExpandableToolbar, type ExpandableToolbarProps} from './ExpandableToolbar';
import type {MenuItem} from '../../StructuralMenu/types';
import type {AnchorPoint} from '../../../utils/popup';

export interface CaretToolbarProps extends ExpandableToolbarProps {
  menu: MenuItem;
  disabled?: boolean;
  onPopupClose?: () => void;
}

export const CaretToolbar: React.FC<CaretToolbarProps> = ({menu, disabled, onPopupClose, ...rest}) => {
  const spanRef = React.useRef<HTMLSpanElement>(null);

  const getExpandPoint = React.useCallback((): AnchorPoint => {
    const el = spanRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      return {x: rect.right + 4, y: rect.y + 32, dx: -1, dy: 1};
    }
    return {x: 32, y: 32, dx: -1, dy: 1};
  }, []);

  return (
    <span ref={spanRef}>
      <ExpandableToolbar
        {...rest}
        menu={menu}
        expandPoint={getExpandPoint}
        disabled={disabled}
        onPopupClose={onPopupClose}
      />
    </span>
  );
};
