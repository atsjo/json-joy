// npx ts-node packages/rpc-server/src/__demos__/sample-api/main-uws.ts
// curl localhost:9999/rpc -H 'Content-Type: rpc.rx.compact.json' -d '[1,1,"ping"]'
// websocat ws://localhost:9999/rx
// [1,1,"util.info"]

import {App} from 'uWebSockets.js';
import {createRpcCallee} from '@jsonjoy.com/rpc-calls/lib/testing/Callee.fixtures';
import {RpcApp} from '../../uws/RpcApp';

const app = new RpcApp({
  uws: App({}),
  callee: createRpcCallee(),
  port: +(process.env.PORT || 9999),
});

app.startWithDefaults();
