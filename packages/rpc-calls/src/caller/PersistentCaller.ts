import type * as msg from '@jsonjoy.com/rpc-messages';
import {firstValueFrom, type Observable, ReplaySubject, timer} from 'rxjs';
import {filter, first, share, switchMap, takeUntil} from 'rxjs/operators';
import {RxCaller, RxCallerOptions} from './RxCaller';
import {PersistentChannel, type PersistentChannelParams} from '@jsonjoy.com/channel';
import {MsgCodecLogicalChannel} from '../channel';
import type {RpcCodec} from '@jsonjoy.com/rpc-codec';
import type {RpcCaller, RpcClientMethods} from './types';

export interface PersistentCallerOptions {
  channel: PersistentChannelParams;
  codec: RpcCodec;
  client?: Omit<RxCallerOptions, 'channel'>;

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
 * RPC client which automatically reconnects if disconnected.
 */
export class PersistentCaller<Methods extends RpcClientMethods<any> = RpcClientMethods> implements RpcCaller<Methods> {
  public channel: PersistentChannel;
  public rpc?: RxCaller<Methods>;
  public readonly rpc$ = new ReplaySubject<RxCaller<Methods>>(1);

  constructor(params: PersistentCallerOptions) {
    const ping = params.ping ?? 15000;
    const codec = params.codec;
    const textEncoder = new TextEncoder();
    this.channel = new PersistentChannel(params.channel);
    this.channel.open$.pipe(filter((open) => open)).subscribe(() => {
      const close$ = this.channel.open$.pipe(filter((open) => !open));
      const channel = new MsgCodecLogicalChannel<, msg.RpcMessage[]>({
        codec,
        channel: this.channel.active$,
      });
      const client = new RxCaller<Methods>({
        ...params.client,
        channel,
      });

      this.channel.message$.pipe(takeUntil(close$)).subscribe((data) => {
        const encoded = typeof data === 'string' ? textEncoder.encode(data) : new Uint8Array(data);
        const messages = codec.decode(encoded, codec.res);
        client.onMessages((messages instanceof Array ? messages : [messages]) as msg.RpcServerMessage[]);
      });

      // Send ping notifications to keep the connection alive.
      if (ping) {
        timer(ping, ping)
          .pipe(takeUntil(close$))
          .subscribe(() => {
            client.notify(params.pingMethod || '.ping', undefined as any);
          });
      }

      if (this.rpc) this.rpc.disconnect();
      this.rpc = client;
      this.rpc$.next(client);
    });
  }

  public call$<K extends keyof Methods>(method: K, data: Observable<Methods[K][0]> | Methods[K][0]): Observable<Methods[K][1]> {
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
