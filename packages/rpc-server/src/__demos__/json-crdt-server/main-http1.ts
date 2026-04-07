// Run: npx ts-node packages/rpc-server/src/__demos__/json-crdt-server/main-http1.ts
// curl localhost:9999/rpc -d '{"method": "util.ping", "id": 0}'
// curl localhost:9999/rx -d '[1,1,"util.ping"]'

import {RpcServer} from '../../http1/RpcServer';
import {createCaller, createServices} from './routes';

export type JsonJoyDemoRpcCaller = ReturnType<typeof createCaller>['caller'];

const main = async () => {
  const services = await createServices();
  const server = await RpcServer.startWithDefaults({
    port: +(process.env.PORT || 9999),
    callee: createCaller(services).caller,
    logger: console,
  });

  // tslint:disable-next-line:no-console
  console.log(server + '');
};

// tslint:disable-next-line no-console
main().catch(console.error);
