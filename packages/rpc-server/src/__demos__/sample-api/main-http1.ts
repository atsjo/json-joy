// npx ts-node packages/rpc-server/src/__demos__/sample-api/main-http1.ts
// curl localhost:9999/rpc -H 'Content-Type: rpc.rx.compact.json' -d '[1,1,"ping"]'
// websocat ws://localhost:9999/rx
// [1,1,"util.info"]

import {createRpcCallee} from '@jsonjoy.com/rpc-calls/lib/testing/Callee.fixtures';
import {RpcServer} from '../../http1/RpcServer';

const server = RpcServer.startWithDefaults({
  port: +(process.env.PORT || 9999),
  callee: createRpcCallee(),
  logger: console,
});

// tslint:disable-next-line no-console
console.log(server + '');
