import {Subject, ReplaySubject, BehaviorSubject, type Observable, map} from 'rxjs';
import {toUint8Array} from '@jsonjoy.com/buffers/lib/toUint8Array';
import {ChannelState} from './constants';
import type {CloseEventBase, PhysicalChannel} from './types';

export type WebSocketBase = Pick<
  WebSocket,
  'binaryType' | 'readyState' | 'bufferedAmount' | 'onopen' | 'onclose' | 'onerror' | 'onmessage' | 'close' | 'send'
>;

export interface WebSocketChannelParams {
  /**
   * Should return a new WebSocket instance. The binary type of the WebSocket
   * will be automatically changed to "arraybuffer".
   */
  newSocket: () => WebSocketBase;
}

/**
 * A client WebSocket wrapper.
 */
export class WebSocketChannel<T extends string | Uint8Array<any> = string | Uint8Array<any>>
  implements PhysicalChannel<T>
{
  /**
   * Native WebSocket reference, or `undefined` if construction of WebSocket
   * failed.
   */
  public readonly ws: WebSocketBase | undefined;

  public readonly state$ = new BehaviorSubject<ChannelState>(ChannelState.CONNECTING);
  public readonly open$ = new ReplaySubject<PhysicalChannel<T>>(1);
  public readonly close$ = new ReplaySubject<[self: PhysicalChannel<T>, event: CloseEventBase]>(1);
  public readonly error$ = new Subject<Error>();
  public readonly message$ = new Subject<T>();

  public closed: boolean = true;
  public onmessage?: (data: T, isUtf8: boolean) => void;
  public onclose?: (code: number, reason: string, wasClean: boolean) => void;

  constructor({newSocket}: WebSocketChannelParams) {
    try {
      const ws = (this.ws = newSocket());
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => {
        this.state$.next(ChannelState.OPEN);
        this.closed = false;
        this.open$.next(this);
        this.open$.complete();
      };
      ws.onclose = (event) => {
        this.state$.next(ChannelState.CLOSED);
        this.closed = true;
        this.close$.next([this, event]);
        this.close$.complete();
        this.message$.complete();
      };
      ws.onerror = (event: Event) => {
        const errorEvent: Partial<ErrorEvent> = event as unknown as Partial<ErrorEvent>;
        const error: Error =
          errorEvent.error instanceof Error ? errorEvent.error : new Error(String(errorEvent.message || 'ERROR'));
        this.error$.next(error);
      };
      ws.onmessage = (event) => {
        const data = event.data;
        const message: T = (typeof data === 'string' ? data : toUint8Array(data)) as unknown as T;
        this.message$.next(message);
        this.onmessage?.(message, typeof data === 'string');
      };
      this.close$.subscribe(([, {code, reason, wasClean}]) => {
        this.closed = true;
        this.onclose?.(code, reason, wasClean);
      });
    } catch (error) {
      this.state$.next(ChannelState.CLOSED);
      this.error$.next(error as Error);
      this.close$.next([this, {code: 0, wasClean: true, reason: 'INIT'}]);
      this.close$.complete();
    }
  }

  public buffer(): number {
    if (!this.ws) return 0;
    return this.ws.bufferedAmount;
  }

  public close(code?: number, reason?: string): void {
    if (!this.ws) return;
    this.ws.close(code, reason);
  }

  public isOpen(): boolean {
    return this.state$.getValue() === ChannelState.OPEN;
  }

  public send(data: T): number {
    if (!this.ws) return -1;
    const buffered = this.ws.bufferedAmount;
    this.ws.send(data);
    return this.ws.bufferedAmount - buffered;
  }

  public send$(data: T): Observable<number> {
    return this.open$.pipe(
      map(() => {
        if (!this.isOpen()) throw new Error('CLOSED');
        return this.send(data);
      }),
    );
  }
}
