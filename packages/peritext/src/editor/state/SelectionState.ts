import {rsync} from '@jsonjoy.com/ui';
import {ExpandableToolbarState} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/ExpandableToolbar';
import type {EditorState} from './EditorState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

export class SelectionState {
  public showTime: number = 0;
  public readonly show = rsync.val(false);

  /** Displayed over the selection focus. */
  public readonly toolbar = rsync.val<ExpandableToolbarState | null>(new ExpandableToolbarState());

  constructor(
    public readonly state: EditorState,
  ) {}

  public onSlashCommand() {
    if (this.show.value && this.toolbar.value) {
      this.toolbar.value.view.next('context');
    }
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const state = this.state;
    const el = state.surface.dom.facade.el;
    const mouseUpListener = () => {
      if (!this.show.value) {
        this.showTime = Date.now();
        this.show.next(true);
      }
    };
    el.addEventListener('mouseup', mouseUpListener);
    state.et.addEventListener('insert', (event) => {
      if (event.detail.text === '/') {
        const editor = state.txt.editor;
        if (editor.cursorCard() === 1) {
          const cursor = editor.cursor;
          if (!cursor.isCollapsed()) {
            event.preventDefault();
            event.stopPropagation();
            this.onSlashCommand();
            return;
          }
        }
      }
    });
    return () => {
      el.removeEventListener('mouseup', mouseUpListener);
    };
  }
}
