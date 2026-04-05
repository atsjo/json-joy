import * as msg from '@jsonjoy.com/rpc-messages';
import {RpcErrorCodes, RpcError} from '@jsonjoy.com/rpc-error';
import {subscribeCompleteObserver} from '../caller/util/subscribeCompleteObserver';
import {TypedRpcError} from '../callee/error/typed';
import {unknown, Value} from '@jsonjoy.com/json-type';
import type {Call} from '../callee/Call';
import type {Callee} from '../callee/types';
import type {Observable} from 'rxjs';
import type {LogicalChannelBase} from '../channel';

/**
 * Processes incoming Reactive-RPC messages and manages in-flight calls. Used
 * for WebSocket servers to handle messages. Implements server-side part of
 * Reactive-RPC protocol.
 */
export class RxLogicalChannelBaseDispatcher<Ctx> {
  private readonly activeStreamCalls: Map<number, Call<unknown, unknown>> = new Map();

  public onSendError: (error: unknown, message: msg.RxMessage) => void = () => {};
  public onMessageError: (error: unknown, message: msg.RxMessage) => void = () => {};
  public onUnknownMessage: (message: unknown) => void = () => {};

  constructor(
    private readonly channel: LogicalChannelBase<msg.RxClientMessage[], msg.RxServerMessage[]>,
    private readonly callee: Callee<Ctx, any>,
    private readonly ctx: Ctx,
  ) {
    channel.onmsg = (messages: msg.RxMessage[]) => this.onMessages(messages, this.ctx);
  }

  private send(message: msg.RxServerMessage | msg.NotificationMessage): void {
    try {
      this.channel.send([message]);
    } catch (error) {
      this.onSendError(error, message);
      this.channel.close();
    }
  }

  /**
   * Receives a list of all incoming messages from the client to process.
   *
   * @param messages A list of received messages.
   * @param ctx Server context.
   */
  public onMessages(messages: msg.RxMessage[], ctx: Ctx): void {
    const length = messages.length;
    for (let i = 0; i < length; i++) this.onMessage(messages[i], ctx);
  }

  /**
   * Processes a single incoming Reactive-RPC message.
   *
   * @param message A single Reactive-RPC message.
   * @param ctx Server context.
   */
  public onMessage(message: msg.RxMessage, ctx: Ctx): void {
    try {
      if (message instanceof msg.RequestDataMessage) this.onRequestDataMessage(message, ctx);
      else if (message instanceof msg.RequestCompleteMessage) this.onRequestCompleteMessage(message, ctx);
      else if (message instanceof msg.RequestErrorMessage) this.onRequestErrorMessage(message, ctx);
      else if (message instanceof msg.NotificationMessage) this.onNotificationMessage(message, ctx);
      else if (message instanceof msg.ResponseUnsubscribeMessage) this.onUnsubscribeMessage(message);
      else this.onUnknownMessage(message);
    } catch (error) {
      this.onMessageError(error, message);
      this.channel.close();
    }
  }

  public sendNotification(method: string, value: Value): void {
    const message = new msg.NotificationMessage(method, value instanceof Value ? value : unknown(value));
    this.send(message);
  }

  protected sendCompleteMessage(id: number, value: Value | unknown | undefined): void {
    const message = new msg.ResponseCompleteMessage(
      id,
      value !== undefined ? (value instanceof Value ? value : unknown(value)) : undefined,
    );
    this.send(message);
  }

  protected sendDataMessage(id: number, value: Value): void {
    const message = new msg.ResponseDataMessage(id, value instanceof Value ? value : unknown(value));
    this.send(message);
  }

  protected sendErrorMessage(id: number, value: unknown): void {
    const errorValue = TypedRpcError.valueFrom(value, value instanceof Value ? value : unknown(value));
    const message = new msg.ResponseErrorMessage(id, errorValue);
    this.send(message);
  }

  protected sendUnsubscribeMessage(id: number): void {
    const message = new msg.RequestUnsubscribeMessage(id);
    this.send(message);
  }

  protected execStaticCall(id: number, name: string, request: unknown, ctx: Ctx): void {
    this.callee
      .call(name, request as any, ctx)
      .then((value: any) => this.sendCompleteMessage(id, value))
      .catch((value: any) => this.sendErrorMessage(id, value));
  }

  protected onStreamError = (id: number, error: Value): void => {
    this.sendErrorMessage(id, error);
    this.activeStreamCalls.delete(id);
  };

  public stop(reason: RpcErrorCodes = RpcErrorCodes.STOP) {
    this.send = <any>(() => {});
    for (const call of this.activeStreamCalls.values()) {
      try {
        call.req$.error(TypedRpcError.valueFromCode(reason));
        call.stop$.next(null);
      } catch (error) {
        // tslint:disable-next-line no-console
        console.error('STOPPING_ERROR', error);
      }
    }
    this.activeStreamCalls.clear();
  }

  public disconnect() {
    this.stop(RpcErrorCodes.DISCONNECT);
  }

  private sendError(id: number, code: RpcErrorCodes): void {
    const data = TypedRpcError.valueFromCode(code);
    this.sendErrorMessage(id, data);
  }

  private createStreamCall(id: number, name: string, ctx: Ctx): Call<unknown, unknown> {
    const call = this.callee.createCall(name, ctx);
    this.activeStreamCalls.set(id, call);
    // call.res$.subscribe({
    //   next: (value: RpcValue) => this.sendDataMessage(id, value),
    //   error: (error: unknown) => this.onStreamError(id, error as RpcValue),
    //   complete: () => {
    //     this.activeStreamCalls.delete(id);
    //     this.sendCompleteMessage(id, undefined);
    //   },
    // });
    subscribeCompleteObserver<Value>(call.res$ as Observable<Value>, {
      next: (value: Value) => {
        this.sendDataMessage(id, value);
      },
      error: (error: unknown) => {
        this.onStreamError(id, error as Value);
      },
      complete: (value: Value | undefined) => {
        this.activeStreamCalls.delete(id);
        this.sendCompleteMessage(id, value);
      },
    });
    call.reqUnsubscribe$.subscribe(() => {
      if (this.activeStreamCalls.has(id)) this.sendUnsubscribeMessage(id);
    });
    return call;
  }

  public onRequestDataMessage(message: msg.RequestDataMessage, ctx: Ctx): void {
    const {id, method, value} = message;
    let call = this.activeStreamCalls.get(id);
    if (!call) {
      if (!method) {
        this.sendError(id, RpcErrorCodes.METHOD_INV);
        return;
      }
      const info = this.callee.info(method);
      if (!info) {
        this.sendError(id, RpcErrorCodes.METHOD_UNK);
        return;
      }
      if (info.rx) {
        call = this.createStreamCall(id, method, ctx);
      } else {
        this.execStaticCall(id, method, value ? value.data : undefined, ctx);
        return;
      }
    }
    if (call) {
      const data = value ? value.data : undefined;
      if (data !== undefined) {
        call.req$.next(data);
      }
    }
  }

  public onRequestCompleteMessage(message: msg.RequestCompleteMessage, ctx: Ctx): void {
    const {id, method, value} = message;
    const call = this.activeStreamCalls.get(id);
    if (call) {
      const {req$} = call;
      const data = value ? value.data : undefined;
      if (data !== undefined) req$.next(data);
      req$.complete();
      return;
    }
    if (!method) {
      // If existing call not found, and method is not specified, it was
      // a *RequestComplete* message sent to a previous call, which already
      // completed, so we just ignore it.
      return;
    }
    const caller = this.callee;
    const info = caller.info(method);
    if (!info) {
      this.sendError(id, RpcErrorCodes.METHOD_UNK);
      return;
    }
    const data = value ? value.data : undefined;
    this.execStaticCall(id, method, data, ctx);
  }

  public onRequestErrorMessage(message: msg.RequestErrorMessage, ctx: Ctx): void {
    const {id, method, value} = message;
    const call = this.activeStreamCalls.get(id);
    if (call) {
      call.req$.error(value.data);
      return;
    }
    if (!method) {
      this.sendError(id, RpcErrorCodes.METHOD_INV);
      return;
    }
    const info = this.callee.info(method);
    if (!info) {
      this.sendError(id, RpcErrorCodes.METHOD_UNK);
      return;
    }
    if (!info.rx) {
      void this.sendError(id, RpcErrorCodes.METHOD_UNK);
      return;
    }
    const streamCall = this.createStreamCall(id, method, ctx);
    if (!streamCall) return;
    streamCall.req$.error(value.data);
  }

  public onUnsubscribeMessage(message: msg.ResponseUnsubscribeMessage): void {
    const {id} = message;
    const call = this.activeStreamCalls.get(id);
    if (!call) return;
    this.activeStreamCalls.delete(id);
    call.req$.complete();
  }

  public onNotificationMessage(message: msg.NotificationMessage, ctx: Ctx): void {
    const {method, value} = message;
    if (!method || method.length > 128) throw RpcError.fromErrno(RpcErrorCodes.METHOD_INV);
    const request = value && typeof value === 'object' ? value?.data : undefined;
    this.callee.notify(method, request, ctx).catch(() => {});
  }
}
