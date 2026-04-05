import {Subject} from 'rxjs';
import * as msg from '@jsonjoy.com/rpc-messages';
import {unknown} from '@jsonjoy.com/json-type';
import type {LogicalChannel} from '../../channel/types';
import type {Callee} from '../../callee/types';
import type {Call} from '../../callee/Call';

/**
 * A loopback logical channel that processes RPC client messages through
 * a local {@link Callee} and sends responses back. Useful for testing
 * {@link RxCaller} and {@link PersistentCaller} without network transport.
 */
export class LoopbackChannel implements LogicalChannel<msg.RxServerMessage[], msg.RxClientMessage[]> {
  public readonly msg$ = new Subject<msg.RxServerMessage[]>();
  public readonly err$ = new Subject<unknown>();

  /** Active server-side calls keyed by request id. */
  private readonly calls = new Map<number, Call>();

  constructor(
    private readonly callee: Callee<any>,
    private readonly ctx: any,
  ) {}

  /**
   * Convert Error instances to plain objects so that non-enumerable
   * properties like `message` survive JSON round-trips through codecs.
   */
  private static serializeError(error: unknown): unknown {
    if (error instanceof Error) {
      const obj: Record<string, unknown> = {message: error.message};
      for (const key of Object.keys(error)) obj[key] = (error as any)[key];
      return obj;
    }
    return error;
  }

  public async send(outgoing: msg.RxClientMessage[]): Promise<void> {
    for (const message of outgoing) {
      this.processMessage(message);
    }
  }

  private processMessage(message: msg.RxClientMessage): void {
    if (message instanceof msg.RequestCompleteMessage) {
      this.onRequestComplete(message);
    } else if (message instanceof msg.RequestDataMessage) {
      this.onRequestData(message);
    } else if (message instanceof msg.RequestErrorMessage) {
      this.onRequestError(message);
    } else if (message instanceof msg.NotificationMessage) {
      this.onNotification(message);
    } else if (message instanceof msg.ResponseUnsubscribeMessage) {
      this.onResponseUnsubscribe(message);
    }
  }

  private onRequestComplete({id, method, value}: msg.RequestCompleteMessage): void {
    const methodName = method || this.getMethodForCall(id);
    if (!methodName) return;
    const call = this.getOrCreateCall(id, methodName);
    if (value) call.req$.next(value.data);
    call.req$.complete();
  }

  private onRequestData({id, method, value}: msg.RequestDataMessage): void {
    const methodName = method || this.getMethodForCall(id);
    if (!methodName) return;
    const call = this.getOrCreateCall(id, methodName);
    if (value) call.req$.next(value.data);
  }

  private onRequestError({id, method, value}: msg.RequestErrorMessage): void {
    const methodName = method || this.getMethodForCall(id);
    if (!methodName) return;
    const call = this.getOrCreateCall(id, methodName);
    call.req$.error(value.data);
  }

  private onNotification({method, value}: msg.NotificationMessage): void {
    const data = value ? value.data : undefined;
    this.callee.notify(method, data, this.ctx);
  }

  private onResponseUnsubscribe({id}: msg.ResponseUnsubscribeMessage): void {
    const call = this.calls.get(id);
    if (call) {
      call.stop$.next(null);
      this.calls.delete(id);
    }
  }

  /** Track method names for streaming calls (first message has method, subsequent have ''). */
  private readonly methodNames = new Map<number, string>();

  private getMethodForCall(id: number): string | undefined {
    return this.methodNames.get(id);
  }

  private getOrCreateCall(id: number, method: string): Call {
    let call = this.calls.get(id);
    if (call) return call;

    this.methodNames.set(id, method);
    call = this.callee.createCall(method, this.ctx);
    this.calls.set(id, call);
    call.res$.subscribe({
      next: (value) => {
        queueMicrotask(() => {
          this.msg$.next([new msg.ResponseDataMessage(id, unknown(value))]);
        });
      },
      error: (error) => {
        const data = LoopbackChannel.serializeError(error);
        queueMicrotask(() => {
          this.msg$.next([new msg.ResponseErrorMessage(id, unknown(data))]);
        });
        this.cleanup(id);
      },
      complete: () => {
        queueMicrotask(() => {
          this.msg$.next([new msg.ResponseCompleteMessage(id, undefined)]);
        });
        this.cleanup(id);
      },
    });

    return call;
  }

  private cleanup(id: number): void {
    this.calls.delete(id);
    this.methodNames.delete(id);
  }
}
