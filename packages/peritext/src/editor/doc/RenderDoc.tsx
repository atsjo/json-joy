import * as React from 'react';
import {Chrome} from '../components/Chrome';
import {EditorState, context} from '../state';
import {EditorPlugin, type EditorPluginOpts} from '../plugin';
import type {PeritextSurfaceState} from '../../web/state';

export interface RenderDocProps {
  surface: PeritextSurfaceState;
  children: React.ReactNode;
  opts: EditorPluginOpts;
}

export const RenderDoc: React.FC<RenderDocProps> = ({surface, opts, children}) => {
  const value: EditorState = React.useMemo(() => {
    const state = new EditorState(surface, opts);
    const plugin = surface.plugins.find(p => p instanceof EditorPlugin);
    if (plugin) plugin.state = state;
    return state;
  }, [surface, opts]);

  React.useLayoutEffect(() => value.start(), [value]);

  return (
    <context.Provider value={value}>
      <Chrome>{children}</Chrome>
    </context.Provider>
  );
};
