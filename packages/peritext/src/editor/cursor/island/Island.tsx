import * as React from 'react';
import * as sync from 'thingies/lib/sync';
import {Inline, InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import {IslandFrame, IslandFrameProps} from './IslandFrame';
import {IslandUnder} from './IslandUnder';
import {Char} from '../../../web/constants';
import {useEditor} from '../../context';
import {FmtManagePaneState} from '../../inline/FmtManagePane/state';
import {useSyncStoreOpt} from '@jsonjoy.com/ui/lib/hooks/useSyncStore';

export interface IslandProps extends IslandFrameProps {
  inline: Inline;
  attr: InlineAttr;
  children?: React.ReactNode;
}

/**
 * A non-editable (contenteditable = false) island in the middle of inline text.
 */
export const Island: React.FC<IslandProps> = (props) => {
  const {children, inline, attr, ...rest} = props;
  const managePaneStateVal = React.useMemo(() => sync.val<FmtManagePaneState | undefined>(void 0), []);
  const managePaneState = useSyncStoreOpt(managePaneStateVal);
  const editor = useEditor();

  const selected = inline?.isSelected();
  let isExactSelection = false;
  if (selected) {
    const selection = inline?.selection();
    isExactSelection = !!selection?.[0] && !!selection?.[1];
  }

  React.useEffect(() => {
    if (!isExactSelection) {
      if (managePaneState) managePaneStateVal.next(void 0);
    } else {
      if (!managePaneState) managePaneStateVal.next(new FmtManagePaneState(editor, inline));
    }
  }, [isExactSelection, editor, inline]);

  return (
    <>
      {Char.ZeroLengthSpace}
      <IslandFrame {...rest}
        selected={selected}
        outline={isExactSelection}
        under={!!managePaneState && <IslandUnder {...props} state={managePaneState} />}
        onMouseDown={() => {
          editor.et.cursor({at: attr.slice, flip: true});
        }}
        onDoubleClick={managePaneState?.switchToEditPanel}
      >
        {children}
      </IslandFrame>
      {Char.ZeroLengthSpace}
    </>
  );
};
