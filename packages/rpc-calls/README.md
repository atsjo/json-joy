# `@jsonjoy.com/rpc-calls`

Implements Reactive RPC procedure calling semantics abstracted away from any
transport or serialization format. Built on top of `@jsonjoy.com/rpc-messages`
and `@jsonjoy.com/rpc-error`.

- *procedure*: A specification of a single RPC procedure (remote function).
- *callee*: A collection of procedures that can be called.
- *caller*: A client that can call procedures on a callee.
- *channel*: A logical communication channel between caller and callee.
