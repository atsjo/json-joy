import * as React from 'react';
import {FormattingManageState} from './state';
import {FormattingList} from './FormattingList';
import {FormattingDisplay} from './FormattingDisplay';
import {useEditor} from '../../context';
import {context} from './context';
import {useSyncStore} from '@jsonjoy.com/ui/lib/hooks/useSyncStore';
import type {Inline} from 'json-joy/lib/json-crdt-extensions';

export interface FmtManagePaneProps {
  inline: Inline;
}

export const FmtManagePane: React.FC<FmtManagePaneProps> = ({inline}) => {
  const editorState = useEditor();
  // biome-ignore lint: too many dependencies
  const state = React.useMemo(() => new FormattingManageState(editorState, inline), [editorState, inline?.key()]);
  const formattings = useSyncStore(React.useMemo(() => state.getFormattings$(), [state]));
  // biome-ignore lint: manually manage dependencies
  React.useLayoutEffect(() => {
    if (formattings.length === 1) {
      state.select(formattings[0]);
    }
  }, [formattings]);
  const selected = useSyncStore(state.selected);

  if (!formattings.length) return null;

  if (selected || formattings.length === 1) {
    return (
      <context.Provider value={state}>
        <FormattingDisplay
          formatting={selected || formattings[0]}
          onClose={!selected || formattings.length === 1 ? void 0 : () => state.select(null)}
        />
      </context.Provider>
    );
  }

  return (
    <context.Provider value={state}>
      <FormattingList formattings={formattings} onSelect={state.select} />
    </context.Provider>
  );
};
