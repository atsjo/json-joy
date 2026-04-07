# `@jsonjoy.com/rpc-server`

HTTP/1.1 and WebSocket server for JSON RPC. Built on Node.js `http`/`https`
modules with a built-in WebSocket implementation (no external WS dependency).

## Features

- HTTP/1.1 server with path-based routing (via `@jsonjoy.com/jit-router`)
- WebSocket upgrade handling with built-in frame codec
- TLS support with automatic secure context refresh
- Multiple RPC codec support: Compact, Binary, JSON-RPC 2.0
- Multiple value encodings: JSON, CBOR, MessagePack
- Content-type based codec negotiation
- Authentication token extraction from headers, query, cookies
- CORS support

## Usage

```ts
import {RpcServer} from '@jsonjoy.com/rpc-server/lib/http1/RpcServer';

const server = await RpcServer.startWithDefaults({
  caller: myCallee,
  port: 8080,
});
```
