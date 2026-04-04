import {UnaryCaller, type UnaryCallerOptions} from './UnaryCaller';
import type {Observable} from 'rxjs';
import type {CompactClientMessage, CompactServerMessage} from '@jsonjoy.com/rpc-messages';
import type {Caller, RpcCallerMethods} from './types';

export interface FetchCallerOptions extends Omit<UnaryCallerOptions, 'send'> {
  /** URL of the RPC endpoint. */
  url: string;

  /** Custom `fetch` implementation, defaults to global `fetch`. */
  fetch?: typeof fetch;
}

/**
 * Simple unary RPC caller that sends batched compact messages via HTTP `fetch`.
 */
export class FetchCaller<Methods extends RpcCallerMethods<any> = RpcCallerMethods> implements Caller<Methods> {
  public readonly caller: UnaryCaller<Methods>;

  constructor(options: FetchCallerOptions) {
    const {url} = options;
    const currentFetch = options.fetch || fetch;
    this.caller = new UnaryCaller<Methods>({
      bufferSize: options.bufferSize,
      bufferTime: options.bufferTime,
      send: async (messages: CompactClientMessage[]): Promise<CompactServerMessage[]> => {
        const response = await currentFetch(url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(messages),
        });
        return await response.json();
      },
    });
  }

  public call$<K extends keyof Methods>(method: K, data: Observable<Methods[K][0]> | Methods[K][0]): Observable<Methods[K][1]> {
    return this.caller.call$(method, data);
  }

  public async call<K extends keyof Methods>(method: K, request: Methods[K][0]): Promise<Methods[K][1]> {
    return this.caller.call(method, request);
  }

  public notify<K extends keyof Methods>(method: K, data: Methods[K][0]): void {
    this.caller.notify(method, data);
  }

  public stop() {
    this.caller.stop();
  }
}
