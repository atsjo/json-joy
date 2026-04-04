# `@jsonjoy.com/rpc-messages`

Message types for the [JSON Reactive RPC](https://jsonjoy.com/specs/json-rx)
protocol. JSON Rx is a lightweight bi-directional RPC protocol with reactive
(Observable) request and response payloads. It supports notifications,
request/response, and full bidirectional streaming over any message-passing
transport (WebSocket, HTTP, IPC, etc.).

## Usage

```ts
import {
  NotificationMessage,
  RequestDataMessage,
  RequestCompleteMessage,
  RequestErrorMessage,
  RequestUnsubscribeMessage,
  ResponseDataMessage,
  ResponseCompleteMessage,
  ResponseErrorMessage,
  ResponseUnsubscribeMessage,
} from '@jsonjoy.com/rpc-messages';
```

## Messages

JSON Rx defines nine message types split between client-sent and server-sent
messages.

### Client to Server

| Class | Description |
|---|---|
| `NotificationMessage` | Fire-and-forget notification; no response expected. |
| `RequestDataMessage` | Initiates a subscription or emits a value into an existing one. |
| `RequestCompleteMessage` | Starts and immediately completes a subscription (unary request). |
| `RequestErrorMessage` | Starts and immediately completes a subscription with an error. |
| `ResponseUnsubscribeMessage` | Client cancels an active response subscription. |

### Server to Client

| Class | Description |
|---|---|
| `NotificationMessage` | Fire-and-forget notification from server. |
| `ResponseDataMessage` | Emits a value in a response subscription. |
| `ResponseCompleteMessage` | Completes a response subscription (with an optional final value). |
| `ResponseErrorMessage` | Completes a response subscription with an error. |
| `RequestUnsubscribeMessage` | Server asks client to stop a request subscription. |

### Communication patterns

- **Notification** — client sends one `NotificationMessage`; server sends nothing back.
- **Request/response** — client sends `RequestCompleteMessage`; server sends `ResponseCompleteMessage`. Both sides emit exactly one value.
- **Server-streaming** — client sends `RequestCompleteMessage`; server sends zero or more `ResponseDataMessage`s followed by `ResponseCompleteMessage`.
- **Client-streaming** — client sends one or more `RequestDataMessage`s followed by `RequestCompleteMessage`; server sends `ResponseCompleteMessage`.
- **Bidirectional streaming** — client streams `RequestDataMessage`s; server streams `ResponseDataMessage`s.

## Validation

Every message class exposes a `validate()` method that throws an
[`RpcError`](../rpc-error) (`BAD_REQUEST`) if the message fields are invalid
(e.g. `id` out of range, `method` name contains illegal characters).
