# JSON CRDT Server

Implementation of JSON CRDT HTTP/Websocket server with persistent on disk or
in-memory storage.


## Configuration

Environment variables:

- `PORT` - port number to listen on, default is 9999.
- `NODE_ENV` - environment, set it to "production" in production.
- `JSON_CRDT_STORE` - storage backend, set it to "level" to use LevelDB.
- `JSON_CRDT_STORE_PATH` - folder to store data on the disk, default is `./db`.


## Start the server

Run the server without installation:

```
npx json-crdt-server
```

Specify the port number:

```
PORT=8080 npx json-crdt-server
```

Also, run in "production" mode and use "level" as the storage backend to persist
content on disk:

```
NODE_ENV=production JSON_CRDT_STORE=level npx json-crdt-server
```

Or, if you git cloned the repository:

```
yarn build

NODE_ENV=production \
PORT=8080 \
JSON_CRDT_STORE=level \
  npx pm2 start lib/main.js \
    --exp-backoff-restart-delay=100
```

Test that server is running, execute JSON-RPC 2.0 request:

```
curl localhost:8080/rpc -H 'Content-Type: rpc.json2.verbose.json' -d '{"method": "util.ping", "id": 1}'
```

Or, execute equivalent JSON Reactive RPC request:

```
curl localhost:8080/rpc -d '[1,1,"util.ping"]'
```
