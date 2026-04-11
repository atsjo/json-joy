// Run: npx ts-node src/main.ts
// curl localhost:9999/rpc -H 'Content-Type: rpc.rx.compact.json' -d '[1,1,"util.ping"]'

import {createCaller, createServices} from './routes';
import {RpcServer} from '@jsonjoy.com/reactive-rpc/lib/server/http1/RpcServer';

export type JsonJoyDemoRpcCaller = ReturnType<typeof createCaller>['caller'];

const main = async () => {
  const services = await createServices();
  const server = await RpcServer.startWithDefaults({
    port: +(process.env.PORT || 9999),
    caller: createCaller(services).caller,
    logger: console,
  });

  // tslint:disable-next-line:no-console
  console.log(server + '');
};

// tslint:disable-next-line no-console
main().catch(console.error);
