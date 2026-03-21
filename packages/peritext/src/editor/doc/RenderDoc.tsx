import * as React from 'react';
import {Chrome} from '../components/Chrome';
import {EditorState, context} from '../state';
import type {PeritextSurfaceState} from '../../web/state';
import type {EditorPluginOpts} from '../plugin';

export interface RenderDocProps {
  surface: PeritextSurfaceState;
  children: React.ReactNode;
  opts: EditorPluginOpts;
}

export const RenderDoc: React.FC<RenderDocProps> = ({surface, opts, children}) => {
  const value: EditorState = React.useMemo(() => new EditorState(surface, opts), [surface, opts]);

  React.useLayoutEffect(() => value.start(), [value]);

  return (
    <context.Provider value={value}>
      <Chrome>{children}</Chrome>
    </context.Provider>
  );
};
