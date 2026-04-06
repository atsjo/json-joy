import {BehaviorSubject, Subject, type Observable, NEVER, of} from 'rxjs';
import type * as msg from '@jsonjoy.com/rpc-messages';
import type {PhysicalChannel, CloseEventBase} from '@jsonjoy.com/channel';
import type {BatchCodec} from '@jsonjoy.com/rpc-codec-base';
import type {Callee} from '../../callee/types';
import {LoopbackChannel} from './LoopbackChannel';

// ChannelState is a const enum, so we use literal values.
const OPEN = 1 as const;
const CLOSED = 2 as const;

/**
 * A loopback physical channel that processes RPC messages through a local
 * {@link Callee}. Useful for testing {@link PersistentCaller} without network
 * transport. Uses a {@link LoopbackChannel} internally for message processing
 * and wraps it in the {@link PhysicalChannel} interface.
 */
export class LoopbackPhysicalChannel implements PhysicalChannel<string> {
  public closed = false;
  public readonly message$ = new Subject<string>();
  public readonly error$: Observable<Error> = NEVER;
  public readonly state$ = new BehaviorSubject<any>(OPEN);
  public readonly open$: Observable<PhysicalChannel<string>>;
  public readonly close$: Observable<[PhysicalChannel<string>, CloseEventBase]> = NEVER;

  private readonly loopback: LoopbackChannel;

  constructor(
    private readonly codec: BatchCodec<string, msg.RxMessage>,
    callee: Callee<any>,
    ctx: any,
  ) {
    this.open$ = of(this as any);
    this.loopback = new LoopbackChannel(callee, ctx);

    // Forward loopback responses back as encoded physical messages.
    this.loopback.msg$.subscribe((messages) => {
      const chunk = this.codec.toChunk(messages as msg.RxMessage[]);
      this.message$.next(chunk);
    });
  }

  isOpen(): boolean {
    return this.state$.value === OPEN;
  }

  send(data: string | Uint8Array): number {
    if (typeof data !== 'string') throw new Error('LoopbackPhysicalChannel only supports string payloads.');
    const messages = this.codec.fromChunk(data);
    this.loopback.send(messages as msg.RxClientMessage[]);
    return 0;
  }

  send$(data: string | Uint8Array): Observable<number> {
    return of(this.send(data));
  }

  close(): void {
    this.closed = true;
    this.state$.next(CLOSED);
  }

  buffer(): number {
    return 0;
  }
}
