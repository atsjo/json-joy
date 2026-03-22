import * as React from 'react';
import type {Inline, InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import {IslandFrame, type IslandFrameProps} from './IslandFrame';
import {IslandUnder} from './IslandUnder';
import {Char} from '../../../web/constants';
import {useEditor} from '../../state/context';
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
  const editor = useEditor();
  const selected = inline?.isSelected();
  const focused = useSyncStoreOpt(editor.surface.dom?.cursor.focus);
  const managePaneState = useSyncStoreOpt(selected ? editor.islandUnder : void 0);

  React.useEffect(() => {
    if (selected) editor.islandSelected(inline, attr);
  }, [selected, attr, editor.islandSelected, inline]);

  return (
    <>
      {Char.ZeroLengthSpace}
      <IslandFrame
        {...rest}
        selected={selected}
        focused={focused}
        outline={!!managePaneState}
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
