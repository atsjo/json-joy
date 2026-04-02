import type {CompactMessage} from './compact';
import type {Type, Value} from '@jsonjoy.com/json-type';
import type * as msg from './messages';

/**
 * Messages that client can send.
 */
export type RpcClientMessage =
  | msg.NotificationMessage
  | msg.RequestDataMessage
  | msg.RequestCompleteMessage
  | msg.RequestErrorMessage
  | msg.ResponseUnsubscribeMessage;

/**
 * Messages with which server can respond.
 */
export type RpcServerMessage =
  | msg.NotificationMessage
  | msg.ResponseDataMessage
  | msg.ResponseCompleteMessage
  | msg.ResponseErrorMessage
  | msg.RequestUnsubscribeMessage;

/**
 * All Reactive RPC messages.
 */
export type RpcMessage = RpcClientMessage | RpcServerMessage;

export interface Message {
  /**
   * Typed payload of the message.
   */
  value?: Value | undefined;

  /**
   * The type of the message `value`.
   */
  type?: Type | undefined;

  /**
   * Perform basic validation of the message. Should throw if the message is invalid.
   */
  validate(): void;

  /**
   * Convert the messages a POJO in [*compact* format](https://jsonjoy.com/specs/json-rx/json-encoding).
   */
  toCompact(): CompactMessage<unknown>;
}
