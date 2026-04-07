import {type BehaviorSubject, map, type Observable} from 'rxjs';
import type {ChannelState} from './constants';
import type {CloseEventBase, PhysicalChannel} from './types';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toU8 = (data: string | Uint8Array): Uint8Array => (typeof data === 'string' ? encoder.encode(data) : data);
const fromU8 = (u8: Uint8Array): string => decoder.decode(u8);

/**
 * A {@link PhysicalChannel} that converts incoming and outgoing messages to
 * `Uint8Array`.
 */
export class Uint8Channel implements PhysicalChannel<Uint8Array> {
  public readonly state$: BehaviorSubject<ChannelState>;
  public readonly open$: Observable<PhysicalChannel<Uint8Array>>;
  public readonly close$: Observable<[self: PhysicalChannel<Uint8Array>, event: CloseEventBase]>;
  public readonly error$: Observable<Error>;
  public readonly message$: Observable<Uint8Array>;

  public get closed(): boolean {
    return this.channel.closed;
  }

  public onmessage?: (data: Uint8Array, isUtf8: boolean) => void;
  public onclose?: (code: number, reason: string, wasClean: boolean) => void;

  constructor(protected readonly channel: PhysicalChannel<string>) {
    this.state$ = channel.state$;
    this.open$ = channel.open$.pipe(map(() => this));
    this.close$ = channel.close$.pipe(
      map(([self, event]) => [this, event] as [self: PhysicalChannel<Uint8Array>, event: CloseEventBase]),
    );
    this.error$ = channel.error$;
    this.message$ = channel.message$.pipe(map(toU8));
    channel.onclose = (code, reason, wasClean) => {
      this.onclose?.(code, reason, wasClean);
    };
    this.message$.subscribe((message: Uint8Array) => {
      this.onmessage?.(message, false);
    });
  }

  public buffer(): number {
    return this.channel.buffer();
  }

  public close(code?: number, reason?: string): void {
    this.channel.close(code, reason);
  }

  public isOpen(): boolean {
    return this.channel.isOpen();
  }

  public send(data: Uint8Array): number {
    return this.channel.send(fromU8(data));
  }

  public send$(data: Uint8Array): Observable<number> {
    return this.channel.send$(fromU8(data));
  }
}
