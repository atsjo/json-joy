import {RpcError, type RpcErrorCodes} from '@jsonjoy.com/rpc-error';
import {Value} from '@jsonjoy.com/json-type';
import {RpcErrorType} from './RpcErrorType';
import type {RpcErrorValue} from './types';

/**
 * @protected
 *
 * Do not import from this module on the client side. It will import the whole
 * `json-type` and `json-expression` libraries, due to `t` builder.
 */

export class TypedRpcError {
  public static value(error: RpcError): RpcErrorValue {
    return new Value(error.toJson(), RpcErrorType);
  }

  public static valueFrom(error: unknown, def = TypedRpcError.internalErrorValue(error)): RpcErrorValue {
    if (error instanceof Value && RpcError.isRpcError(error.data) && error.type === RpcErrorType) return error;
    if (RpcError.isRpcError(error)) return TypedRpcError.value(error);
    return def;
  }

  public static valueFromCode(errno: RpcErrorCodes, message?: string): RpcErrorValue {
    return TypedRpcError.value(RpcError.fromErrno(errno, message));
  }

  public static internalErrorValue(originalError: unknown): RpcErrorValue {
    return TypedRpcError.value(RpcError.internal(originalError));
  }
}
