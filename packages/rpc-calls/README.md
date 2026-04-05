# `@jsonjoy.com/rpc-calls`

Implements Reactive RPC procedure calling semantics abstracted away from any
transport or serialization format. Built on top of `@jsonjoy.com/rpc-messages`
and `@jsonjoy.com/rpc-error`.


## Concepts

Transport:

- `PhysicalChannel` &mdash; comes from `@jsonjoy.com/channel` package, represents
  a low-level transport (WebSocket, HTTP, etc). It is a duplex stream of raw messages
  in `string` or `Uint8Array` format.
- `LogicalChannel` &mdash; an abstraction over `PhysicalChannel` that provides
  message framing/encoding/decoding. It transforms raw messages into structured
  RPC messages and vice versa.

RPC:

- `Procedure` &mdash; A specification of a single RPC procedure (remote function).
- `Callee` &mdash; A collection of procedures that can be called, on the server side.
- `Caller` &mdash; A client that can call remote procedures.
- `Dispatcher` &mdash; connects a `LogicalChannel` to a `Callee`, routing incoming
  messages to the appropriate procedure and sending responses back.


## Architectural Overview

A high-level overview of the RPC building blocks:

```
Caller → LogicalChannel → PhysicalChannel ← LogicalChannel ← Dispatcher → Callee → Procedure
^^^^^^   ↓  |                               ↓  |                          ^^^^^^
         Codec                              Codec
            ↓                                  ↓
            Buffering/Batching                 Buffering/Batching
```

Simplest in-process setup for API testing:

```
Caller → CalleeCaller → Callee → Procedure
^^^^^^                  ^^^^^^
```

A more realistic detailed setup with reconnection (persistent channel), batching,
and codecs over a WebSocket transport:

```
ReliableCaller → FetchCaller (HTTP fallback, see below)
  ↓
RxPersistentCaller → PersistentPhysicalChannel → WebSocketChannel(PhysicalChannel)
  ↓                                               ┊
RxLogicalChannelCaller(Caller)                    ┊
  ↓                    ^^^^^^                     ┊
BufferedLogicalChannel                            ┊
  ↓                                               ┊
RxBatchCodecLogicalChannel(                       ┊
  BatchCodecLogicalChannel(LogicalChannel)) ---→ WebSocketChannel(PhysicalChannel)
     ╰→ BatchCodec                                ┊↑
                                            (TCP network)
                                                  ↓┊
                                                 PhysicalChannelBase
                                                  ↑
RxLogicalChannelBase(LogicalChannelBase) ---------╯
 ↑     ╰→ RpcCodec → (StreamCodec + JsonValueCodec)
 │                     ╰→ | rx.binary        ╰→ | cbor
 │                        | rx.compact          | json
 │                        | json2.verbose       | msgpack
 │
BufferedLogicalChannelBase
 ↑
RxLogicalChannelBaseDispatcher (Reactive RPC message router to Callee/Procedure)
 ↓     ╰→ Ctx
Callee → Procedure
^^^^^^
```

A realistic HTTP-based unary RPC client using `fetch()`:

```
FetchCaller(UnaryCaller(Caller))
  ↓                     ^^^^^^
fetch()
  ┊↑
(HTTP network)
  ↓┊
RxBatchCodecDispatcher → Ctx
 │     ╰→ RpcCodec → (StreamCodec + JsonValueCodec)
 │                     ╰→ | rx.binary        ╰→ | cbor
 │                        | rx.compact          | json
 │                        | json2.verbose       | msgpack
 ↓
Callee → Procedure
^^^^^^
```


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
