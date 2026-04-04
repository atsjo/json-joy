# `@jsonjoy.com/rpc-calls`

Implements Reactive RPC procedure calling semantics abstracted away from any
transport or serialization format. Built on top of `@jsonjoy.com/rpc-messages`
and `@jsonjoy.com/rpc-error`.

## Concepts

- **Procedure** &mdash; A specification of a single RPC procedure (remote function).
- **Callee** &mdash; A collection of procedures that can be called, the server side.
- **Caller** &mdash; A client that can call procedures on a callee, the client side.
- **Channel** &mdash; A logical communication channel between caller and callee.

## Callers

Several caller implementations are provided:

- `RxCaller` &mdash; Full streaming RPC client using RxJS observables over a
  logical message channel.
- `UnaryCaller` &mdash; Unary (request/response) RPC client with batching
  support using compact message format.
- `PersistentCaller` &mdash; Reconnecting RPC client that wraps `RxCaller` and
  re-establishes the logical channel on each new physical connection.
- `FetchRpcCaller` &mdash; Simple HTTP-based unary RPC client using the
  browser `fetch()` API.
- `CalleeCaller` &mdash; In-process caller that directly invokes a callee,
  useful for testing and local execution.

## Installation

```
npm install @jsonjoy.com/rpc-calls
```

## License

Apache-2.0
