# `@jsonjoy.com/rpc-error`

RPC error class and error codes for JSON Reactive RPC APIs.

## Usage

```ts
import {RpcError, RpcErrorCodes} from '@jsonjoy.com/rpc-error';
```

## `RpcError`

`RpcError` extends `Error` and implements `IRpcError`. It carries a `code`
(string), `errno` (number), optional `errorId`, `meta`, and `originalError`.

### Factory methods

```ts
// Wrap any unknown error as INTERNAL_ERROR
RpcError.from(err);

// Create from a numeric error code
RpcError.fromErrno(RpcErrorCodes.NOT_FOUND, 'Not Found');

// Create from a named error code
RpcError.fromCode('CONFLICT', 'Already exists');

// Create with a fully custom code string
RpcError.create('MY_CODE', 'Something went wrong', 42, meta, cause);

// Convenience factories
RpcError.internal(cause);
RpcError.badRequest('Invalid input', meta);
RpcError.notFound('User not found');
RpcError.validation('Invalid id', meta);
RpcError.conflict('Duplicate key');
```

### Serialization

```ts
const err = RpcError.badRequest('Missing field');
err.toJson();
// { message: 'Missing field', code: 'BAD_REQUEST', errno: 1 }
```

### Type guard

```ts
RpcError.isRpcError(value); // true if value is an RpcError instance
```

## `RpcErrorCodes`

| Name             | Value | HTTP equivalent |
|------------------|-------|-----------------|
| `INTERNAL_ERROR` | 0     | 500             |
| `BAD_REQUEST`    | 1     | 400             |
| `TIMEOUT`        | 2     | 408             |
| `NOT_FOUND`      | 3     | 404             |
| `CONFLICT`       | 4     | 409             |
| `METHOD_UNK`     | 5     |                 |
| `METHOD_INV`     | 6     |                 |
| `STOP`           | 7     |                 |
| `DISCONNECT`     | 8     |                 |
| `OVERFLOW`       | 9     |                 |
| `THROTTLE`       | 10    |                 |
| `AUTH`           | 11    | 401             |
| `AUTHC`          | 12    | 401             |
| `AUTHZ`          | 13    | 403             |
