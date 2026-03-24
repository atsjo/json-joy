import * as React from 'react';
import {context} from './context';
import {CursorState} from './state';
import type {PeritextSurfaceState} from '../../web/state';
import type {CursorPluginOpts} from './CursorPlugin';

export interface RenderDocProps {
  ctx: PeritextSurfaceState;
  opts: CursorPluginOpts;
  children?: React.ReactNode;
}

export const RenderDoc: React.FC<RenderDocProps> = ({ctx, opts, children}) => {
  const state = React.useMemo(() => new CursorState(ctx, opts.caret), [ctx, opts.caret]);
  React.useEffect(() => state.start(), [state]);

  return <context.Provider value={state}>{children}</context.Provider>;
};
