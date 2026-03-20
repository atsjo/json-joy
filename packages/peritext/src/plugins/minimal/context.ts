import * as React from 'react';
import type {PeritextSurfaceState} from '../../web/state';
import type {Value} from 'json-joy/lib/util/events/sync-store';

export interface MinimalPluginContextValue {
  ctx: PeritextSurfaceState;

  /** Current score. */
  score: Value<number>;

  /** By how much the score changed. */
  scoreDelta: Value<number>;

  /** The last score that was shown to the user. */
  lastVisScore: Value<number>;
}

export const context = React.createContext<MinimalPluginContextValue>(null!);

export const usePlugin = () => React.useContext(context);
