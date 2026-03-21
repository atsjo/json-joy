import * as React from 'react';
import {Inline, InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import {Kbd} from '@jsonjoy.com/ui/lib/context/kbd';
import {IslandFrame, IslandFrameProps} from './IslandFrame';
import {IslandUnder} from './IslandUnder';
import {Char} from '../../../web/constants';
import {useEditor} from '../../context';
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
  const managePaneState = useSyncStoreOpt(selected ? editor.islandUnder : void 0);

  React.useEffect(() => {
    if (selected) editor.islandSelected(inline, attr);
  }, [selected]);

  return (
    <Kbd bind={[
      ['Escape', () => {
        editor.islandUnder.next(null);
      }]
    ]}>
      {Char.ZeroLengthSpace}
      <IslandFrame {...rest}
        selected={selected}
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
    </Kbd>
  );
};
