import {Observable, of} from 'rxjs';
import type {Callee} from '../callee/types';
import type {ProcedureReq, ProcedureRes, Procedures} from '../procedures';
import type {ProceduresToCallerMethods, Caller} from './types';

export class CalleeCaller<Ctx = unknown, P extends Procedures<any> = Procedures<Ctx>> implements Caller<ProceduresToCallerMethods<P>> {
  constructor(protected readonly caller: Callee<Ctx, P>, public ctx: Ctx) {}

  public call$<K extends keyof P>(method: K, data: Observable<ProcedureReq<P[K]>> | ProcedureReq<P[K]>): Observable<ProcedureRes<P[K]>> {
    return this.caller.call$(method, data instanceof Observable ? data : of(data), this.ctx);
  }

  public call<K extends keyof P>(method: K, request: ProcedureReq<P[K]>): Promise<ProcedureRes<P[K]>> {
    return this.caller.call(method, request, this.ctx);
  }

  public notify<K extends keyof P>(method: K, data: ProcedureReq<P[K]>): void {
    this.caller.notify(method, data, this.ctx);
  }
}
