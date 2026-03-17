import {Inline, InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import * as React from 'react';
import {IslandFrame, IslandFrameProps} from './IslandFrame';
import {IslandUnder} from './IslandUnder';
import {Char} from '../../../web/constants';
import {useEditor} from '../../context';

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
  let isExactSelection = false;
  if (selected) {
    const selection = inline?.selection();
    isExactSelection = !!selection?.[0] && !!selection?.[1];
  }

  return (
    <>
      {Char.ZeroLengthSpace}
      <IslandFrame {...rest}
        selected={selected}
        outline={isExactSelection}
        under={<IslandUnder {...props} selected={selected && isExactSelection} />}
        onMouseDown={() => {
          editor.et.cursor({at: attr.slice, flip: true});
        }}
        onDoubleClick={() => {
          console.log('DOUBLE CLICK');
        }}
      >
        {children}
      </IslandFrame>
      {Char.ZeroLengthSpace}
    </>
  );
};
