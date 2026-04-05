import {Subject, ReplaySubject, BehaviorSubject, type Observable, of} from 'rxjs';
import {toUint8Array} from '@jsonjoy.com/buffers/lib/toUint8Array';
import {ChannelState} from './constants';
import type {CloseEventBase, PhysicalChannel} from './types';

export interface FetchPhysicalChannelOptions {
  fetch: (data: Uint8Array) => Promise<Uint8Array>;
}

/**
 * A `Channel` interface using Fetch implementation.
 */
export class FetchPhysicalChannel<T extends string | Uint8Array = string | Uint8Array> implements PhysicalChannel<T> {
  public readonly state$ = new BehaviorSubject<ChannelState>(ChannelState.CONNECTING);
  public readonly open$ = new ReplaySubject<PhysicalChannel<T>>(1);
  public readonly close$ = new ReplaySubject<[self: PhysicalChannel<T>, event: CloseEventBase]>(1);
  public readonly error$ = new Subject<Error>();
  public readonly message$ = new Subject<T>();

  public closed: boolean = false;
  public onmessage?: (data: T, isUtf8: boolean) => void;
  public onclose?: (code: number, reason: string, wasClean: boolean) => void;

  protected readonly _fetch: (data: Uint8Array) => Promise<Uint8Array>;

  constructor({fetch}: FetchPhysicalChannelOptions) {
    this._fetch = fetch;
    this.state$.next(ChannelState.OPEN);
    this.open$.next(this);
    this.open$.complete();
  }

  public buffer(): number {
    return 0;
  }

  public close(code?: number, reason?: string): void {
    this.closed = true;
    this.state$.next(ChannelState.CLOSED);
    this.close$.next([this, {code: code ?? 1000, reason: reason ?? 'Normal Closure', wasClean: true}]);
    this.onclose?.(code ?? 1000, reason ?? 'Normal Closure', true);
  }

  public isOpen(): boolean {
    return !this.closed;
  }

  public send(data: T): number {
    const uint8 = typeof data === 'string' ? toUint8Array(data) : (data as Uint8Array);
    this._fetch(uint8)
      .then((response) => {
        const message: T = (typeof response === 'string' ? response : toUint8Array(response)) as unknown as T;
        this.message$.next(message);
        this.onmessage?.(message, typeof response === 'string');
      })
      .catch((error) => {
        this.error$.next(error);
      });
    return 0;
  }

  public send$(data: T): Observable<number> {
    return of(this.send(data));
  }
}
