import * as sync from 'thingies/lib/sync';
import {compare, type ITimestampStruct} from 'json-joy/lib/json-crdt-patch';
import {SliceTypeName} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import {NewFmt} from './formattings/NewFmt';
import {inlines as defaultSpans} from '../inline/tags';
import {FmtManagePaneState} from '../inline/FmtManagePane/state';
import {Menu} from './menus/Menu';
import type {InlineSliceBehavior} from '../inline/InlineSliceBehavior';
import type {Key} from '@jsonjoy.com/keyboard';
import type {Inline, InlineAttr, PeritextEventTarget} from 'json-joy/lib/json-crdt-extensions';
import type {Peritext} from 'json-joy/lib/json-crdt-extensions';
import type {PeritextSurfaceState} from '../../web/state';
import type {MenuItem} from '../types';
import type {EditorPluginOpts} from '../plugin';
import type {PeritextCursorEvent, PeritextEventDetailMap} from 'json-joy/lib/json-crdt-extensions/peritext/events';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

export class EditorState implements UiLifeCycles {
  public readonly txt: Peritext;
  public lastEvent: PeritextEventDetailMap['change']['ev'] | undefined = void 0;
  public lastEventTs: number = 0;
  public readonly showInlineToolbar = sync.val<[show: boolean, time: number]>([false, 0]);

  public readonly menu = new Menu(this);

  /**
   * New slice configuration. This is used for new slices which are not yet
   * applied to the text as they need to be configured first.
   */
  public readonly newSlice = sync.val<NewFmt | undefined>(void 0);

  public readonly activeSlice = sync.val<undefined>(void 0);

  /**
   * The ID of the active (where the main cursor or focus is placed) leaf block.
   */
  public readonly activeLeafBlockId$ = sync.val<ITimestampStruct | null>(null);

  /** State of the active (exactly selected) island "under" cursor popup, if any. */
  public readonly islandUnder = sync.val<FmtManagePaneState | null>(null);

  public readonly et: PeritextEventTarget;

  public readonly spanOrder: Record<string | number, number> = {};
  public readonly spanMap: Record<string | number, InlineSliceBehavior> = {};
  
  constructor(
    public readonly surface: PeritextSurfaceState,
    public readonly opts: EditorPluginOpts,
    public readonly spans: InlineSliceBehavior[] = defaultSpans as InlineSliceBehavior[]
  ) {
    this.txt = this.surface.dom.txt;
    this.et = surface.headless.et;
    const length = spans.length;
    for (let i = 0; i < length; i++) {
      const tag = spans[i].tag;
      this.spanOrder[tag] = i;
      this.spanMap[tag] = spans[i];
    }
  }

  private _setActiveLeafBlockId = () => {
    const {activeLeafBlockId$, txt} = this;
    const {overlay, editor} = txt;
    const value = activeLeafBlockId$.value;
    const cardinality = editor.cursorCard();
    if (cardinality !== 1 || (cardinality === 1 && !editor.mainCursor()?.isCollapsed())) {
      if (value) activeLeafBlockId$.next(null);
      return;
    }
    const focus = editor.mainCursor()?.focus();
    const marker = focus ? overlay.getOrNextLowerMarker(focus) : void 0;
    const markerId = marker?.marker.start.id ?? txt.str.id;
    const doSet = !value || compare(value, markerId) !== 0;
    if (doSet) activeLeafBlockId$.next(markerId);
  };

  private setLastEv(lastEvent: PeritextEventDetailMap['change']['ev']) {
    this.lastEvent = lastEvent;
    this.lastEventTs = Date.now();
  }

  public islandSelected(inline: Inline, attr: InlineAttr): void {
    const {islandUnder, txt, surface} = this;
    const editor = txt.editor;
    if (editor.cursorCard() !== 1) {
      islandUnder.next(null);
      return;
    }
    const selection = inline.selection();
    const isExactSelection = !!selection?.[0] && !!selection?.[1];
    if (!isExactSelection) {
      islandUnder.next(null);
      return;
    }
    const state = new FmtManagePaneState(this, inline, surface.headless.kbd);
    islandUnder.next(state);
  }

  // private doShowInlineToolbar(): boolean {
  //   const {surface, lastEvent} = this;
  //   if (surface.dom!.cursor.mouseDown.value) return false;
  //   if (!lastEvent) return false;
  //   const lastEventIsCursorEvent = lastEvent?.type === 'cursor';
  //   if (!lastEventIsCursorEvent) return false;
  //   if (!surface.peritext.editor.cursorCount()) return false;
  //   return true;
  // }

  /** Open popup to start configuring a new slice. */
  public startSliceConfig(tag: SliceTypeName | string | number, menu?: MenuItem): NewFmt | undefined {
    const editor = this.txt.editor;
    const behavior = editor.getRegistry().get(tag);
    const range = editor.mainCursor()?.range();
    if (!range) return;
    const newSlice = this.newSlice;
    if (!behavior) {
      newSlice.next(void 0);
      return;
    }
    const formatting = new NewFmt(behavior, range, this);
    newSlice.next(formatting);
    return formatting;
  }

  // public registerSlice(tag: TypeTag, data: SliceRegistryEntryData): ToolBarSliceRegistryEntry {
  //   const registry = this.txt.editor.getRegistry();
  //   const entry = registry.get(tag);
  // }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const {surface, showInlineToolbar, newSlice: newSliceConfig} = this;
    const {dom, events} = surface;
    const {et} = events;
    const mouseDown = dom!.cursor.mouseDown;
    const el = dom.facade.el;

    const registry = this.txt.editor.getRegistry();
    for (const behavior of defaultSpans) {
      registry.add(behavior);
    }
    // Object.assign(registry.get(SliceTypeName.a)?.data() || {}, behavior.a);
    // // registry.add({});
    // Object.assign(registry.get(SliceTypeName.col)?.data() || {}, behavior.col);

    const changeUnsubscribe = et.subscribe('change', (ev) => {
      const lastEvent = ev.detail.ev;
      this.setLastEv(lastEvent);
      this._setActiveLeafBlockId();
    });

    const {txt, islandUnder} = this;
    const cursorUnsubscribe = et.subscribe('cursor', (ev) => {
      const islandUnderValue = islandUnder.value;
      if (islandUnderValue) {
        const editor = txt.editor;
        if (editor.cursorCard() !== 1 || !islandUnderValue.inline || editor.cursor.cmp(islandUnderValue.inline) !== 0) {
          islandUnder.next(null);
        }
      }
    });

    const unsubscribeMouseDown = mouseDown?.subscribe(() => {
      // if (mouseDown.value) showInlineToolbar.next(false);
    });

    const mouseDownListener = (event: MouseEvent) => {
      // showInlineToolbar.next(false);
      // if (showInlineToolbar.value[0])
      //   showInlineToolbar.next([false, Date.now()]);
    };
    const mouseUpListener = (event: MouseEvent) => {
      if (!showInlineToolbar.value[0]) showInlineToolbar.next([true, Date.now()]);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape': {
          if (newSliceConfig.value) {
            event.stopPropagation();
            event.preventDefault;
            newSliceConfig.next(void 0);
            return;
          }
          break;
        }
      }
    };
    const onKeyDownDocument = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'k': {
          if (event.metaKey) {
            const editor = this.txt.editor;
            if (
              editor.hasCursor() &&
              !editor.mainCursor()?.isCollapsed() &&
              (!newSliceConfig.value || newSliceConfig.value.behavior.tag !== SliceTypeName.a)
            ) {
              event.stopPropagation();
              event.preventDefault;
              this.startSliceConfig(SliceTypeName.a, this.menu.range.linkMenuItem());
              return;
            }
          }
          break;
        }
      }
    };
    const onCursor = ({detail}: PeritextCursorEvent) => {
      // Close config popup on non-focus cursor moves.
      if (newSliceConfig.value) {
        const isFocusMove = detail.move && detail.move.length === 1 && detail.move[0][0] === 'focus';
        if (!isFocusMove) {
          this.newSlice.next(void 0);
        }
      }
    };

    el.addEventListener('mousedown', mouseDownListener);
    el.addEventListener('mouseup', mouseUpListener);
    el.addEventListener('keydown', onKeyDown);
    document.addEventListener('keydown', onKeyDownDocument);
    et.addEventListener('cursor', onCursor);

    const unbindHotkeys = this.surface.headless.kbd.bind([
      [
        'Escape',
        (press: Key) => {
          if (islandUnder.value) {
            islandUnder.next(null);
          } else {
            press.propagate = true;
          }
        },
      ],
    ]);

    const unbindHotkeysSurface = dom.kbd?.bind([
      [
        'Meta Meta',
        () => {
          et.cursor({flip: true});
        },
      ],
    ]);

    return () => {
      changeUnsubscribe();
      cursorUnsubscribe();
      unsubscribeMouseDown?.();
      el.removeEventListener('mousedown', mouseDownListener);
      el.removeEventListener('mouseup', mouseUpListener);
      el.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keydown', onKeyDownDocument);
      et.removeEventListener('cursor', onCursor);
      unbindHotkeys();
      unbindHotkeysSurface?.();
    };
  }
}
