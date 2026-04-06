import type {Observable} from 'rxjs';
import type {Procedures, ProcedureReq, ProcedureRes} from '../procedures';
import type {Call} from './Call';

/**
 * A *callee* is a server-side object, which implements methods to call
 * Reactive-RPC {@link Procedures} (methods) on the server. It is essentially a
 * collection of {@link Procedures}. The "server" is a logical concept, it may
 * be a remote server or a local one.
 */
export interface Callee<Ctx = unknown, P extends Procedures<any> = Procedures<Ctx>> {
  info<K extends keyof P>(name: K): Pick<P[K], 'pretty' | 'rx'> | undefined;
  createCall<K extends keyof P>(name: K, ctx: Ctx): Call<ProcedureReq<P[K]>, ProcedureRes<P[K]>>;
  call<K extends keyof P>(name: K, request: ProcedureReq<P[K]>, ctx: Ctx): Promise<ProcedureRes<P[K]>>;
  call$<K extends keyof P>(
    name: K,
    request$: Observable<ProcedureReq<P[K]>> | ProcedureReq<P[K]>,
    ctx: Ctx,
  ): Observable<ProcedureRes<P[K]>>;
  notify<K extends keyof P>(method: K, data: ProcedureReq<P[K]>, ctx: Ctx): Promise<void>;
}

/**
 * A type-erased version of {@link Callee} that is structurally compatible with
 * any `Callee` or `RpcCallee` instance. Useful where the concrete procedure
 * map is not needed.
 */
export interface AnyCallee {
  info(name: string): {pretty: boolean; rx: boolean} | undefined;
  createCall(name: string, ctx: unknown): Call<unknown, unknown>;
  call(name: string, request: unknown, ctx: unknown): Promise<unknown>;
  call$(name: string, request$: Observable<unknown> | unknown, ctx: unknown): Observable<unknown>;
  notify(method: string, data: unknown, ctx: unknown): Promise<void>;
}
