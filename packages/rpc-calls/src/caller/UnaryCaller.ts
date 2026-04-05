import {TimedQueue} from './util/TimedQueue';
import {Defer} from 'thingies/lib/Defer';
import {Observable, of, switchMap} from 'rxjs';
import {CompactBinBatchCodec} from '@jsonjoy.com/rpc-codec/lib/CompactBinBatchCodec';
import {unknown} from '@jsonjoy.com/json-type/lib/value/Value';
import {
  type RxMessage,
  NotificationMessage,
  RequestCompleteMessage,
  ResponseCompleteMessage,
  ResponseErrorMessage,
} from '@jsonjoy.com/rpc-messages';
import type {Caller, CallerMethods} from './types';
import type {BinBatchCodec} from '@jsonjoy.com/rpc-codec-base';

/**
 * Configuration parameters for {@link UnaryCaller}.
 */
export interface UnaryCallerOptions {
  /**
   * Method to be called by client when it wants to send messages to the server.
   * This is usually connected to your WebSocket "send" method.
   */
  send?: (messages: Uint8Array) => Promise<Uint8Array>;

  /**
   * Codec used to encode/decode Rx RPC messages over the wire.
   */
  codec?: BinBatchCodec<RxMessage>;

  /**
   * Number of messages to keep in buffer before sending them to the server.
   * The buffer is flushed when the message reaches this limit or when the
   * buffering time has reached the time specified in `bufferTime` parameter.
   * Defaults to 100 messages.
   */
  bufferSize?: number;

  /**
   * Time in milliseconds for how long to buffer messages before sending them
   * to the server. Defaults to 10 milliseconds.
   */
  bufferTime?: number;
}

/**
 * Implements an *unary* RPC caller, a client which can send a single request
 * and receive a single response for each call. However, it does support
 * batching of messages, so multiple requests can be sent at once and
 * received in a single response.
 *
 * (This means `.call$()` is supported, it sends and receives a single message.)
 */
export class UnaryCaller<Methods extends CallerMethods<any> = CallerMethods> implements Caller<Methods> {
  private id = 1;
  public readonly buffer: TimedQueue<RxMessage>;
  public onsend: (messages: Uint8Array) => Promise<Uint8Array> = async () => {
    throw new Error('onsend not implemented');
  };

  /**
   * In-flight RPC calls.
   */
  private readonly calls = new Map<number, Defer<unknown>>();

  constructor({send, codec = new CompactBinBatchCodec(), bufferSize = 100, bufferTime = 10}: UnaryCallerOptions) {
    if (send) this.onsend = send;
    this.buffer = new TimedQueue();
    this.buffer.itemLimit = bufferSize;
    this.buffer.timeLimit = bufferTime;
    this.buffer.onFlush = (messages: RxMessage[]) => {
      const chunk = codec.toChunk(messages as RxMessage[]);
      this.onsend(chunk)
        .then((responses: Uint8Array) => {
          const messages = codec.fromChunk(responses);
          for (const message of messages) {
            if (message instanceof NotificationMessage) continue;
            const id = message.id;
            const calls = this.calls;
            const future = calls.get(id);
            calls.delete(id);
            if (!future) continue;
            if (message instanceof ResponseCompleteMessage) future.resolve(message.value?.data);
            else if (message instanceof ResponseErrorMessage) future.reject(message.value?.data);
          }
        })
        .catch((error) => {
          for (const message of messages) {
            if (message instanceof RequestCompleteMessage) {
              const id = message.id;
              const calls = this.calls;
              const future = calls.get(id);
              calls.delete(id);
              if (!future) continue;
              future.reject(error);
            }
          }
        });
    };
  }

  public call$<K extends keyof Methods>(
    method: K,
    data: Observable<Methods[K][0]> | Methods[K][0],
  ): Observable<Methods[K][1]> {
    return (data instanceof Observable ? data : of(data)).pipe(switchMap((data) => this.call(method, data)));
  }

  public async call<K extends keyof Methods>(method: K, request: Methods[K][0]): Promise<Methods[K][1]> {
    const id = this.id++;
    if (this.id >= 0xffff) this.id = 1;
    const message = new RequestCompleteMessage(id, method as string, unknown(request));
    const future = new Defer<unknown>();
    this.calls.set(id, future);
    this.buffer.push(message);
    return await future.promise;
  }

  /**
   * Send a one-way notification message without expecting any response.
   *
   * @param method Remote method name.
   * @param data Static payload data.
   */
  public notify<K extends keyof Methods>(method: K, data: Methods[K][0]): void {
    const msg = new NotificationMessage(method as string, unknown(data));
    this.buffer.push(msg);
  }

  public stop() {}
}
