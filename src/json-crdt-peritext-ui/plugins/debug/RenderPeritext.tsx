import * as React from 'react';
import {drule, rule, useTheme} from 'nano-theme';
import {context} from './context';
import {Button} from '../../components/Button';
import {Console} from './Console';
import {ValueSyncStore} from '../../../util/events/sync-store';
import {useSyncStore} from '../../react/hooks';
import {DebugState} from './state';
import type {PeritextSurfaceState, PeritextViewProps} from '../../react';

const blockClass = rule({
  pos: 'relative',
});

const btnClass = drule({
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pos: 'absolute',
  t: '-16px',
  r: 0,
  pd: '2px',
  bdrad: '8px',
  bxsh: '0 1px 8px #00000008,0 1px 4px #0000000a,0 4px 10px #0000000f',
});

const childrenDebugClass = rule({
  out: '1px dotted black !important',
});

export interface RenderPeritextProps extends PeritextViewProps {
  state?: DebugState;
  button?: boolean;
  children?: React.ReactNode;
  ctx?: PeritextSurfaceState;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({
  state: state_,
  ctx,
  button,
  children,
}) => {
  const theme = useTheme();
  const state = React.useMemo(() => state_ ?? new DebugState(), [state_]);
  useSyncStore(state.enabled);
  const value = React.useMemo(
    () => ({
      state,
      ctx,
      flags: {
        dom: new ValueSyncStore(true),
        editor: new ValueSyncStore(true),
        peritext: new ValueSyncStore(false),
        model: new ValueSyncStore(false),
      },
    }),
    [state, ctx],
  );

  return (
    <context.Provider value={value}>
      <div
        className={blockClass}
        onKeyDown={(event) => {
          switch (event.key) {
            case 'D': {
              if (event.ctrlKey) {
                event.preventDefault();
                state.toggleDebugMode();
              }
              break;
            }
          }
        }}
      >
        {!!button && (
          <div
            className={btnClass({
              bg: theme.bg,
            })}
          >
            <Button small active={state.enabled.getSnapshot()} onClick={() => state.enabled.next(!state.enabled.getSnapshot())}>
              Debug
            </Button>
          </div>
        )}
        <div className={state.enabled.getSnapshot() ? childrenDebugClass : undefined}>{children}</div>
        {state.enabled.getSnapshot() && <Console />}
      </div>
    </context.Provider>
  );
};
