import type {ConnectionContext} from '../types';
import type {UwsHttpConnectionContext} from './context';
import type {UwsConnection} from './UwsConnection';
import type * as uws from './types-uws';

export * from './types-uws';

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'trace' | 'connect';
export type HttpMethodPermissive =
  | HttpMethod
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
  | 'TRACE'
  | 'CONNECT';

export type RouteHandler = (ctx: UwsHttpConnectionContext) => void | Promise<void>;
export type JsonRouteHandler = (ctx: UwsHttpConnectionContext) => unknown | Promise<unknown>;

export interface RpcWebSocket extends uws.WebSocket {
  uwsConnection: UwsConnection;
  ctx: ConnectionContext;
}

export interface ServerLogger {
  log(msg: unknown): void;
  error(kind: string, error?: Error | unknown | null, meta?: unknown): void;
}
