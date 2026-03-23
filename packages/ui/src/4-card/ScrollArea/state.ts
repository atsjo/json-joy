import * as sync from 'thingies/lib/sync';
import {DEFAULT_RAIL_WIDTH, DEFAULT_MIN_THUMB_SIZE, DEFAULT_HIDE_DELAY} from './constants';
import type {ScrollStateOpts} from './types';
import type {UiLifeCycles} from '../../types';

export class ScrollState implements UiLifeCycles {
  public readonly scrollTop$ = sync.val<number>(0);
  public readonly scrollHeight$ = sync.val<number>(0);
  public readonly clientHeight$ = sync.val<number>(0);
  public readonly maxScrollTop$: sync.Computed<number>;
  public readonly scrollRatio$: sync.Computed<number>;
  public readonly thumbRatio$: sync.Computed<number>;
  public readonly canScroll$: sync.Computed<boolean>;
  public readonly visible$ = sync.val<boolean>(false);
  public readonly alwaysVisible$: sync.Value<boolean>;
  public readonly railWidth$: sync.Value<number>;
  public readonly minThumbSize: number;
  public readonly hideDelay: number;
  public readonly headerHeight$ = sync.val<number>(0);
  public readonly footerHeight$ = sync.val<number>(0);
  public viewportEl: HTMLDivElement | null = null;
  public railEl: HTMLDivElement | null = null;
  public thumbEl: HTMLDivElement | null = null;

  private _hideTimer = 0;
  private _dragging = false;
  private _dragPointerOffset = 0;
  private _prevWebkitUserSelect = '';
  private _resizeObserver: ResizeObserver | null = null;
  private _rafId = 0;

  constructor(opts?: ScrollStateOpts) {
    this.railWidth$ = sync.val<number>(opts?.railWidth ?? DEFAULT_RAIL_WIDTH);
    this.minThumbSize = opts?.minThumbSize ?? DEFAULT_MIN_THUMB_SIZE;
    this.hideDelay = opts?.hideDelay ?? DEFAULT_HIDE_DELAY;
    this.alwaysVisible$ = sync.val<boolean>(opts?.alwaysVisible ?? false);
    const {scrollTop$, scrollHeight$, clientHeight$} = this;
    this.maxScrollTop$ = sync.comp(
      [scrollHeight$, clientHeight$],
      ([scrollHeight, clientHeight]) => Math.max(0, scrollHeight - clientHeight),
    );
    this.scrollRatio$ = sync.comp(
      [scrollTop$, this.maxScrollTop$],
      ([scrollTop, maxScrollTop]) => (maxScrollTop > 0 ? scrollTop / maxScrollTop : 0),
    );
    this.thumbRatio$ = sync.comp(
      [clientHeight$, scrollHeight$],
      ([clientHeight, scrollHeight]) => (scrollHeight > 0 ? clientHeight / scrollHeight : 1),
    );
    this.canScroll$ = sync.comp(
      [scrollHeight$, clientHeight$],
      ([scrollHeight, clientHeight]) => scrollHeight > clientHeight,
    );
  }

  public scrollTo(top: number): void {
    const el = this.viewportEl;
    if (!el) return;
    el.scrollTop = Math.max(0, Math.min(top, this.maxScrollTop$.value));
  }

  public scrollToRatio(ratio: number): void {
    this.scrollTo(Math.max(0, Math.min(1, ratio)) * this.maxScrollTop$.value);
  }

  public scrollBy(delta: number): void {
    const el = this.viewportEl;
    if (!el) return;
    el.scrollTop += delta;
  }

  public setViewport = (el: HTMLDivElement | null): void => {
    this.viewportEl = el;
  };

  public setRail = (el: HTMLDivElement | null): void => {
    this.railEl = el;
  };

  public setThumb = (el: HTMLDivElement | null): void => {
    this.thumbEl = el;
  };

  public showScrollbar(): void {
    if (!this.visible$.value) this.visible$.next(true);
    this._resetHideTimer();
  }

  public hideScrollbar(): void {
    if (this.visible$.value) this.visible$.next(false);
    window.clearTimeout(this._hideTimer);
  }

  private _resetHideTimer(): void {
    window.clearTimeout(this._hideTimer);
    if (this.alwaysVisible$.value) return;
    this._hideTimer = window.setTimeout(() => {
      if (!this._dragging) this.visible$.next(false);
    }, this.hideDelay);
  }

  private _onScroll = (): void => {
    const el = this.viewportEl;
    if (!el) return;
    this.scrollTop$.next(el.scrollTop);
    this.showScrollbar();
  };

  private _onResize = (): void => {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = 0;
      const el = this.viewportEl;
      if (!el) return;
      const sh = el.scrollHeight;
      const ch = el.clientHeight;
      if (sh !== this.scrollHeight$.value) this.scrollHeight$.next(sh);
      if (ch !== this.clientHeight$.value) this.clientHeight$.next(ch);
    });
  };

  public thumbHeight(railHeight: number): number {
    return Math.max(this.minThumbSize, this.thumbRatio$.value * railHeight);
  }

  public thumbTop(railHeight: number): number {
    const th = this.thumbHeight(railHeight);
    return this.scrollRatio$.value * (railHeight - th);
  }

  public onThumbPointerDown(clientY: number): void {
    const thumb = this.thumbEl;
    if (!thumb) return;
    this._dragging = true;
    const rect = thumb.getBoundingClientRect();
    this._dragPointerOffset = clientY - rect.top;
    this._prevWebkitUserSelect = document.body.style.webkitUserSelect;
    document.body.style.webkitUserSelect = 'none';
    if (this.viewportEl) this.viewportEl.style.scrollBehavior = 'auto';
  }

  public onThumbPointerMove(clientY: number): void {
    if (!this._dragging) return;
    const rail = this.railEl;
    if (!rail) return;
    const railRect = rail.getBoundingClientRect();
    const railHeight = railRect.height;
    const th = this.thumbHeight(railHeight);
    const pointerInRail = clientY - railRect.top;
    const thumbTop = pointerInRail - this._dragPointerOffset;
    const maxThumbTop = railHeight - th;
    const ratio = maxThumbTop > 0 ? thumbTop / maxThumbTop : 0;
    this.scrollToRatio(Math.max(0, Math.min(1, ratio)));
  }

  public onThumbPointerUp(): void {
    this._dragging = false;
    document.body.style.webkitUserSelect = this._prevWebkitUserSelect;
    if (this.viewportEl) this.viewportEl.style.scrollBehavior = '';
    this._resetHideTimer();
  }

  public onRailClick(clientY: number): void {
    const rail = this.railEl;
    if (!rail) return;
    const railRect = rail.getBoundingClientRect();
    const ratio = (clientY - railRect.top) / railRect.height;
    this.scrollToRatio(Math.max(0, Math.min(1, ratio)));
  }

  public onRailWheel(deltaY: number): void {
    this.scrollBy(deltaY);
  }

  public start(): () => void {
    const el = this.viewportEl;
    if (el) {
      el.addEventListener('scroll', this._onScroll, {passive: true});
      this.scrollHeight$.next(el.scrollHeight);
      this.clientHeight$.next(el.clientHeight);
      this.scrollTop$.next(el.scrollTop);
    }

    this._resizeObserver = new ResizeObserver(this._onResize);
    if (el) {
      this._resizeObserver.observe(el);
      const content = el.firstElementChild;
      if (content) this._resizeObserver.observe(content);
    }

    if (this.alwaysVisible$.value) {
      this.visible$.next(true);
    }

    return () => {
      if (el) el.removeEventListener('scroll', this._onScroll);
      this._resizeObserver?.disconnect();
      this._resizeObserver = null;
      window.clearTimeout(this._hideTimer);
      if (this._rafId) {
        cancelAnimationFrame(this._rafId);
        this._rafId = 0;
      }
    };
  }
}
