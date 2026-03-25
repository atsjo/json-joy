import * as sync from 'thingies/lib/sync';
import {HslColor} from '@jsonjoy.com/ui';
import type {ChangeDetail} from 'json-joy/lib/json-crdt-extensions/peritext/events';
import type {UiLifeCycles} from '../../web/types';
import type {PeritextSurfaceState} from '../../web/state';

export class CursorState implements UiLifeCycles {
  /** Current score. */
  public readonly score = sync.val(0);

  /** By how much the score changed. */
  public readonly scoreDelta = sync.val(0);

  /** The last score that was shown to the user. */
  public readonly lastVisScore = sync.val(0);

  public readonly lastScoreTime = sync.val(0);

  constructor(
    public readonly ctx: PeritextSurfaceState,
    public readonly color = new HslColor(210 / 360, 1, 0.5),
  ) {}

  /** -------------------------------------------------- {@link UiLifeCycles} */
  public start(): () => void {
    const dom = this.ctx.dom;

    const onChange = (event: CustomEvent<ChangeDetail>) => {
      const now = Date.now();
      const timeDiff = now - this.lastScoreTime.value;
      let delta = 0;
      switch (event.detail.ev?.type) {
        case 'delete':
        case 'insert':
        case 'format':
        case 'marker': {
          delta = timeDiff < 30 ? 10 : timeDiff < 70 ? 5 : timeDiff < 150 ? 2 : timeDiff <= 1000 ? 1 : -1;
          break;
        }
        default: {
          delta = timeDiff <= 1000 ? 0 : -1;
          break;
        }
      }
      if (delta) this.score.next(delta >= 0 ? this.score.value + delta : 0);
      this.scoreDelta.next(delta);
      this.lastScoreTime.next(now);
    };

    dom.et.addEventListener('change', onChange);
    return () => {
      dom.et.removeEventListener('change', onChange);
    };
  }
}
