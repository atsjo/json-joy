import {BehaviorSubject} from 'rxjs';
import type {UiLifeCycles} from '../../../types';

export type OpenPanelStateOpts = {};

const COOL_DOWN_TIME = 69;

export class OpenPanelState implements UiLifeCycles {
  public readonly selected$ = new BehaviorSubject('');

  protected canSelectAfter: number = 0;
  protected lastClosed: string = '';
  protected hovered: string = '';
  private focusStack: HTMLElement[] = [];
  private pendingTimer: ReturnType<typeof setTimeout> | 0 = 0;

  constructor(public readonly opts: OpenPanelStateOpts = {}) {}

  public readonly start = () => {
    return () => {
      this.clearPending();
    };
  };

  private clearPending(): void {
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = 0;
    }
  }

  private schedulePending(id: string): void {
    this.clearPending();
    const delay = this.canSelectAfter - Date.now();
    if (delay <= 0) return;
    this.pendingTimer = setTimeout(() => {
      this.pendingTimer = 0;
      if (this.hovered === id && this.selected$.value !== id) {
        this.forceSelect(id);
      }
    }, delay);
  }

  public readonly hover = (id: string) => {
    const selected = this.selected$.value;
    if (id === this.lastClosed && selected !== id) return;
    if (!selected) {
      this.clearPending();
      this.forceSelect(id);
      return;
    }
    const now = Date.now();
    if (selected === id) {
      this.clearPending();
      this.canSelectAfter = now + COOL_DOWN_TIME;
      this.hovered = id;
      return;
    }
    if (now <= this.canSelectAfter) {
      this.canSelectAfter = now + COOL_DOWN_TIME;
      this.hovered = id;
      this.schedulePending(id);
      return;
    }
    this.clearPending();
    this.hovered = id;
    this.select(id);
  };

  public readonly select = (id: string): void => {
    const selected = this.selected$.value;
    if (selected === id) {
      this.deselect();
    } else {
      const now = Date.now();
      if (now > this.canSelectAfter) {
        this.forceSelect(id, now + COOL_DOWN_TIME);
      } else {
      }
    }
  };

  public deselect(): boolean {
    const selected = this.selected$.value;
    if (!selected) return false;
    this.clearPending();
    this.lastClosed = selected;
    this.hovered = '';
    this.canSelectAfter = Date.now() + COOL_DOWN_TIME;
    this.selected$.next('');
    // Restore focus to the parent item that opened this submenu.
    const prev = this.focusStack.pop();
    if (prev && typeof prev.focus === 'function') requestAnimationFrame(() => prev.focus());
    return true;
  }

  /**
   * Forcefully select an item, ignoring any pending unlock cool down.
   *
   * @param id ID of the item to select.
   */
  public forceSelect(id: string, canSelectAfter = Date.now() + COOL_DOWN_TIME): void {
    this.lastClosed = id;
    this.hovered = id;
    this.canSelectAfter = canSelectAfter;
    // Save the currently focused element so we can restore it on deselect.
    const focused = document.activeElement;
    if (focused instanceof HTMLElement) this.focusStack.push(focused);
    this.selected$.next(id);
  }

  public readonly onClick = this.select;
  public readonly onMouseMove = this.hover;
  public readonly onMouseLeave = () => {
    this.clearPending();
    this.hovered = '';
  };
}
