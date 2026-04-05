import type {Observable} from 'rxjs';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';
import type {BatchCodec} from '@jsonjoy.com/rpc-codec-base';
import {FetchChannel} from '@jsonjoy.com/channel';
import {MsgCodecLogicalChannel} from '../channel';
import {RxCaller} from './RxCaller';
import type {Caller, CallerMethods} from './types';

export interface FetchCallerOptions {
  /** URL of the RPC endpoint. */
  url: string;

  /** Codec used to encode/decode RPC messages over the wire. */
  codec: BatchCodec<Uint8Array, RxMessage>;

  /** Custom `fetch` implementation, defaults to global `fetch`. */
  fetch?: typeof fetch;
}

/**
 * Simple HTTP-based RPC caller that sends messages via `fetch()`. Uses
 * {@link FetchChannel} as the physical transport, {@link MsgCodecLogicalChannel}
 * for encoding/decoding, and {@link RxCaller} for RPC semantics.
 */
export class FetchCaller<Methods extends CallerMethods<any> = CallerMethods> implements Caller<Methods> {
  public readonly rpc: RxCaller<Methods>;

  constructor(options: FetchCallerOptions) {
    const {url, codec} = options;
    const currentFetch = options.fetch || fetch;
    const physicalChannel = new FetchChannel({
      fetch: async (data: Uint8Array): Promise<Uint8Array> => {
        const response = await currentFetch(url, {
          method: 'POST',
          headers: {'Content-Type': 'application/octet-stream'},
          body: data,
        });
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
      },
    });
    const logicalChannel = new MsgCodecLogicalChannel({
      codec,
      channel: physicalChannel,
    });
    this.rpc = new RxCaller<Methods>({channel: logicalChannel as any});
  }

  public call$<K extends keyof Methods>(method: K, data: Observable<Methods[K][0]> | Methods[K][0]): Observable<Methods[K][1]> {
    return this.rpc.call$(method, data);
  }

  public async call<K extends keyof Methods>(method: K, request: Methods[K][0]): Promise<Methods[K][1]> {
    return this.rpc.call(method, request);
  }

  public notify<K extends keyof Methods>(method: K, data: Methods[K][0]): void {
    this.rpc.notify(method, data);
  }

  public stop() {
    this.rpc.stop();
  }
}
