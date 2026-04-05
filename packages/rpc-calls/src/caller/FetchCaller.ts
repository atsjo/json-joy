import {UnaryCaller} from './UnaryCaller';
import type {UnaryCallerOptions} from './UnaryCaller';
import type {Observable} from 'rxjs';
import type {Caller, CallerMethods} from './types';

export interface FetchCallerOptions extends Omit<UnaryCallerOptions, 'send'> {
  /** URL of the RPC endpoint. */
  url: string;

  /** Custom `fetch` implementation, defaults to global `fetch`. */
  fetch?: typeof fetch;

  /** Additional HTTP headers to include in every request. */
  headers?: Record<string, string>;
}

/**
 * HTTP-based RPC caller built on top of {@link UnaryCaller}. Sends batched
 * messages to the server via `fetch()` POST requests.
 */
export class FetchCaller<Methods extends CallerMethods<any> = CallerMethods> implements Caller<Methods> {
  public readonly caller: UnaryCaller<Methods>;

  constructor(options: FetchCallerOptions) {
    const {url, headers, fetch: customFetch, ...rest} = options;
    const currentFetch = customFetch || fetch;
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/octet-stream',
      ...headers,
    };

    this.caller = new UnaryCaller<Methods>({
      ...rest,
      send: async (data: Uint8Array): Promise<Uint8Array> => {
        const response = await currentFetch(url, {
          method: 'POST',
          headers: reqHeaders,
          body: data as any,
        });
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
      },
    });
  }

  public call$<K extends keyof Methods>(
    method: K,
    data: Observable<Methods[K][0]> | Methods[K][0],
  ): Observable<Methods[K][1]> {
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
