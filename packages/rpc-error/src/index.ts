export interface IRpcError {
  /**
   * Human readable error message.
   */
  message: string;

  /**
   * Error code, a short string that identifies the error. Should be unique.
   */
  code?: string;

  /**
   * Same as `code`, but as a number.
   */
  errno?: number;

  /**
   * Unique error identifier. The ID by which the error can be looked up in logs.
   */
  errorId?: string;

  /**
   * Additional data about the error.
   */
  meta?: unknown;
}

/**
 * Common error codes for RPC errors.
 */
export enum RpcErrorCodes {
  /** Any unknown sever error is wrapped into INTERNAL_ERROR, error 500. */
  INTERNAL_ERROR = 0,

  /** When request is not valid, e.g. when request validation fails, error 400. */
  BAD_REQUEST = 1,

  /**
   * Error thrown when there was no activity on a
   * stream for a long time, and timeout was reached.
   */
  TIMEOUT = 2,

  /** Resource not found, error 404. */
  NOT_FOUND = 3,

  /** When operation cannot be performed due to a conflict, error 409. */
  CONFLICT = 4,

  METHOD_UNK = 5,
  METHOD_INV = 6,
  STOP = 7,
  DISCONNECT = 8,
  OVERFLOW = 9,
  THROTTLE = 10,
  AUTH = 11,
  AUTHC = 12,
  AUTHZ = 13,
}

export class RpcError extends Error implements IRpcError {
  public static from = (error: unknown | Error, message?: string): RpcError =>
    error instanceof RpcError ? error : RpcError.internal(error, message);

  public static fromErrno = (
    errno: RpcErrorCodes,
    message = '',
    meta: unknown = undefined,
    originalError: unknown = undefined,
  ): RpcError => {
    const code = RpcErrorCodes[errno];
    return new RpcError(message || code, code, errno, undefined, meta || undefined, originalError);
  };

  public static fromCode = (
    code: keyof typeof RpcErrorCodes,
    message?: string,
    meta: unknown = undefined,
    originalError: unknown = undefined,
  ): RpcError => new RpcError(message || code, code, RpcErrorCodes[code], undefined, meta || undefined, originalError);

  public static create = (
    code: string,
    message?: string,
    errno: number = 0,
    meta: unknown = undefined,
    originalError: unknown = undefined,
  ): RpcError => new RpcError(message || code, code, errno, undefined, meta || undefined, originalError);

  public static internal = (originalError: unknown, message = 'Internal Server Error'): RpcError =>
    RpcError.fromErrno(RpcErrorCodes.INTERNAL_ERROR, message, undefined, originalError);

  public static badRequest = (message = 'Bad Request', meta?: unknown, originalError?: unknown): RpcError =>
    RpcError.fromErrno(RpcErrorCodes.BAD_REQUEST, message, meta, originalError);

  public static notFound = (message = 'Not Found', meta?: unknown, originalError?: unknown): RpcError =>
    RpcError.fromErrno(RpcErrorCodes.NOT_FOUND, message, meta, originalError);

  public static validation = (message?: string, meta?: unknown, originalError?: unknown): RpcError =>
    RpcError.fromErrno(RpcErrorCodes.BAD_REQUEST, message, meta, originalError);

  public static conflict = (message?: string, meta?: unknown, originalError?: unknown): RpcError =>
    RpcError.fromErrno(RpcErrorCodes.CONFLICT, message, meta, originalError);

  public static isRpcError = (error: unknown): error is RpcError =>
    error instanceof Error &&
    (error as any)[Symbol.toStringTag] === 'RpcError' &&
    typeof (error as any).toJson === 'function';

  [Symbol.toStringTag] = 'RpcError';

  constructor(
    public readonly message: string,
    public readonly code: string | undefined,
    public readonly errno: number,
    public readonly errorId: string | undefined,
    public readonly meta: unknown | undefined,

    /**
     * Original error that caused this error.
     */
    public readonly originalError: Error | unknown | undefined,
  ) {
    super(message);
    Object.setPrototypeOf(this, RpcError.prototype);
  }

  public toJson(): IRpcError {
    const err: IRpcError = {message: this.message};
    if (this.code) err.code = this.code;
    if (this.errno) err.errno = this.errno;
    if (this.errorId) err.errorId = this.errorId;
    if (this.meta) err.meta = this.meta;
    return err;
  }
}
