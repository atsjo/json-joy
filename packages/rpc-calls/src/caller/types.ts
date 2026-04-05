import type {Observable} from 'rxjs';
import type {ProcedureReq, ProcedureRes, Procedures} from '../procedures';

export type CallerCall<Req = unknown, Res = unknown> = [req: Req, res: Res];
export type CallerMethods<T = unknown> = Record<string, CallerCall<T, T>>;

export type ProceduresToCallerMethods<P extends Procedures<any>> = {
  [K in keyof P]: CallerCall<ProcedureReq<P[K]>, ProcedureRes<P[K]>>;
};

export interface Caller<Methods extends CallerMethods<any> = CallerMethods> {
  /**
   * Execute a streaming RPC method.
   *
   * @param method RPC method name.
   * @param data RPC method static payload or stream of data.
   */
  call$<K extends keyof Methods>(method: K, data: Observable<Methods[K][0]> | Methods[K][0]): Observable<Methods[K][1]>;

  /**
   * Execute a one-way RPC method.
   *
   * @param method RPC method name.
   * @param request RPC method static payload.
   */
  call<K extends keyof Methods>(method: K, data: Methods[K][0]): Promise<Methods[K][1]>;

  /**
   * Send a one-way notification message without expecting any response.
   *
   * @param method Remote method name.
   * @param data Static payload data.
   */
  notify<K extends keyof Methods>(method: K, data: Methods[K][0]): void;
}
