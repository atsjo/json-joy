// Run: npx ts-node packages/rpc-server/src/__demos__/json-crdt-server/main-uws.ts
// curl localhost:9999/rx -d '[1,1,"util.ping"]'

import {App} from 'uWebSockets.js';
import {RpcApp} from '../../uws/RpcApp';
import {createCaller, createServices} from './routes';

export type JsonJoyDemoRpcCaller = ReturnType<typeof createCaller>['caller'];

const main = async () => {
  const services = await createServices();
  const app = new RpcApp({
    uws: App({}),
    callee: createCaller(services).caller,
    port: +(process.env.PORT || 9999),
  });
  app.startWithDefaults();

  // tslint:disable-next-line:no-console
  console.log(app + '');
};

// tslint:disable-next-line no-console
main().catch(console.error);
