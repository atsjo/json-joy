import {rsync} from '@jsonjoy.com/ui';
import type {ExpandableToolbarState} from '@jsonjoy.com/ui/src/4-card/Toolbar/ToolbarMenu/ExpandableToolbar';
import type {EditorState} from './EditorState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

export class SelectionState {
  public showTime: number = 0;
  public readonly show = rsync.val(false);

  /** Displayed over the selection focus. */
  public readonly toolbar = rsync.val<ExpandableToolbarState | null>(null);

  constructor(
    public readonly state: EditorState,
  ) {}

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const el = this.state.surface.dom.facade.el;
    const mouseUpListener = () => {
      if (!this.show.value) {
        this.showTime = Date.now();
        this.show.next(true);
      }
    };
    el.addEventListener('mouseup', mouseUpListener);
    return () => {
      el.removeEventListener('mouseup', mouseUpListener);
    };
  }
}
