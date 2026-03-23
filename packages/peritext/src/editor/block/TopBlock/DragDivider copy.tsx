import * as React from 'react';
import {rule} from 'nano-theme';
import {Divider, DividerProps} from 'react-split-pane';

const blockClass = rule({
  '.split-pane-divider': {
    background: '#eee',
    transition: 'background 0.1s',
  },
  '.split-pane-divider:hover': {
    background: '#b0b0b0',
  },
  '.split-pane-divider:focus': {
    background: '#2196f3',
    outline: '2px solid #2196f3',
    outlineOffset: '-2px',
  },
});

export const DragDivider2: React.FC<DividerProps> = (props) => {
  return (
    <div contentEditable={false} className={blockClass}>
      <Divider {...props} />
    </div>
  );
};