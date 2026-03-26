import {rsync} from '@jsonjoy.com/ui';
import {ExpandableToolbarState} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/ExpandableToolbar';
import {NewFmt} from './formattings';
import type {EditorState} from './EditorState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import type {PeritextCursorEvent, PeritextInsertEvent, SliceTypeName} from 'json-joy/lib/json-crdt-extensions';

export class SelectionState {
  public showTime: number = 0;
  public readonly show = rsync.val(false);

  /** Displayed over the selection focus. */
  public readonly toolbar = rsync.val<ExpandableToolbarState | null>(new ExpandableToolbarState());

  /**
   * New slice configuration. This is used for new slices which are not yet
   * applied to the text as they need to be configured first.
   */
  public readonly newSlice = rsync.val<NewFmt | undefined>(void 0);

  constructor(
    public readonly state: EditorState,
  ) {}

  public openCtxMenu() {
    if (this.show.value && this.toolbar.value) {
      this.toolbar.value.view.next('context');
    }
  }

  /** Open popup to start configuring a new slice. */
  public startSliceConfig(tag: SliceTypeName | string | number): NewFmt | undefined {
    const state = this.state;
    const editor = state.txt.editor;
    const behavior = state.spanMap[tag];
    if (!behavior) return;
    const range = editor.mainCursor()?.range();
    if (!range) return;
    const newSlice = this.newSlice;
    if (!behavior) {
      newSlice.next(void 0);
      return;
    }
    const formatting = new NewFmt(behavior, range, state);
    newSlice.next(formatting);
    return formatting;
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const {state, newSlice} = this;
    const et = state.et;
    const el = state.surface.dom.facade.el;
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape': {
          if (newSlice.value) {
            event.stopPropagation();
            event.preventDefault();
            newSlice.next(void 0);
            return;
          }
          break;
        }
      }
    };
    const mouseUpListener = () => {
      if (!this.show.value) {
        this.showTime = Date.now();
        this.show.next(true);
      }
    };
    const onInsert = (event: PeritextInsertEvent) => {
      if (event.detail.text === '/') {
        const editor = state.txt.editor;
        if (editor.cursorCard() === 1) {
          const cursor = editor.cursor;
          if (!cursor.isCollapsed()) {
            event.preventDefault();
            event.stopPropagation();
            this.openCtxMenu();
            return;
          }
        }
      }
    };
    const onCursor = ({detail}: PeritextCursorEvent) => {
      // Close config popup on non-focus cursor moves.
      if (newSlice.value) {
        const isFocusMove = detail.move && detail.move.length === 1 && detail.move[0][0] === 'focus';
        if (!isFocusMove) newSlice.next(void 0);
      }
    };
    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('mouseup', mouseUpListener);
    et.addEventListener('insert', onInsert);
    et.addEventListener('cursor', onCursor);
    return () => {
      el.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('mouseup', mouseUpListener);
      et.removeEventListener('insert', onInsert);
      et.removeEventListener('cursor', onCursor);
    };
  }
}
