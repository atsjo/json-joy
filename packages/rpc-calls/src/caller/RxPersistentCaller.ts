import type * as msg from '@jsonjoy.com/rpc-messages';
import {firstValueFrom, type Observable, ReplaySubject, timer} from 'rxjs';
import {filter, first, share, switchMap, takeUntil} from 'rxjs/operators';
import {RxLogicalChannelCaller} from './RxLogicalChannelCaller';
import {PersistentPhysicalChannel, type PersistentPhysicalChannelOptions} from '@jsonjoy.com/channel';
import {RxBatchCodecLogicalChannel} from '../channel/RxBatchCodecLogicalChannel';
import type {BatchCodec} from '@jsonjoy.com/rpc-codec-base';
import type {Caller, CallerMethods} from './types';

export interface RxPersistentCallerOptions {
  physical: PersistentPhysicalChannelOptions;
  codec: BatchCodec<string | Uint8Array, msg.RxMessage>;

  /**
   * Number of milliseconds to periodically send keep-alive ".ping" notification
   * messages. If not specified, will default to 15,000 (15 seconds). If 0, will
   * not send ping messages.
   */
  ping?: number;

  /**
   * The notification method name that is used for ping keep-alive messages, if
   * not specified, defaults to ".ping".
   */
  pingMethod?: string;
}

/**
 * Persistent Reactive (Rx) JSON RPC client, with the following features:
 *
 * - Automatically reconnects if disconnected.
 * - Sends periodic keep-alive ".ping" notifications to keep the connection alive.
 *
 * Uses a {@link PersistentPhysicalChannel} to maintain a physical connection. On
 * each new connection a {@link RxBatchCodecLogicalChannel} is constructed from the
 * physical channel and the provided codec, then an {@link RxCaller} is created
 * on top of it.
 */
export class RxPersistentCaller<Methods extends CallerMethods<any> = CallerMethods> implements Caller<Methods> {
  public channel: PersistentPhysicalChannel;
  public rpc?: RxLogicalChannelCaller<Methods>;
  public readonly rpc$ = new ReplaySubject<RxLogicalChannelCaller<Methods>>(1);

  constructor(params: RxPersistentCallerOptions) {
    const ping = params.ping ?? 15000;
    this.channel = new PersistentPhysicalChannel(params.physical);
    this.channel.open$.pipe(filter((open) => open)).subscribe(() => {
      const close$ = this.channel.open$.pipe(filter((open) => !open));
      const physicalChannel = this.channel.channel$.value;
      if (!physicalChannel) return;
      const channel = new RxBatchCodecLogicalChannel({
        codec: params.codec,
        channel: physicalChannel,
      });
      const caller = new RxLogicalChannelCaller<Methods>({
        channel: channel as any,
      });
      // Send ping notifications to keep the connection alive.
      if (ping) {
        timer(ping, ping)
          .pipe(takeUntil(close$))
          .subscribe(() => {
            caller.notify(params.pingMethod || '.ping', undefined as any);
          });
      }

      if (this.rpc) this.rpc.disconnect();
      this.rpc = caller;
      this.rpc$.next(caller);
    });
  }

  public call$<K extends keyof Methods>(
    method: K,
    data: Observable<Methods[K][0]> | Methods[K][0],
  ): Observable<Methods[K][1]> {
    return this.rpc$.pipe(
      first(),
      switchMap((rpc) => rpc.call$(method, data as any)),
      share(),
    );
  }

  public async call<K extends keyof Methods>(method: K, request: Observable<Methods[K][0]>): Promise<Methods[K][1]> {
    return firstValueFrom(this.call$(method, request));
  }

  public notify<K extends keyof Methods>(method: K, data: Observable<Methods[K][0]>): void {
    this.rpc$.subscribe((rpc) => rpc.notify(method, data));
  }

  public start() {
    this.channel.start();
  }

  public stop() {
    this.channel.stop();
    if (this.rpc) this.rpc.stop();
  }
}
