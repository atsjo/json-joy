// Run: npx ts-node packages/json-crdt-server/src/main.ts
// curl localhost:8080/rpc -H 'Content-Type: rpc.rx.compact.json' -d '[1,1,"util.ping"]'

import * as fs from 'node:fs';
import {createCaller, createServices} from './routes';
import {RpcServer, type RpcServerStartOpts} from '@jsonjoy.com/rpc-server/lib/http1/RpcServer';
import type * as tls from 'node:tls';

export type JsonJoyDemoRpcCaller = ReturnType<typeof createCaller>['caller'];

const main = async () => {
  const SSL_KEY = process.env.SSL_KEY;
  const SSL_CRT = process.env.SSL_CRT;
  const isSecure = !!SSL_KEY && !!SSL_CRT;
  const services = await createServices();
  const port = +(process.env.PORT || (isSecure ? 8443 : 8080));

  const options: RpcServerStartOpts = {
    port,
    callee: createCaller(services).caller,
    logger: console,
  };

  if (isSecure) {
    const secureContext = async (): Promise<tls.SecureContextOptions> => {
      return {
        key: await fs.promises.readFile(SSL_KEY),
        cert: await fs.promises.readFile(SSL_CRT),
      };
    };
    options.create = {
      tls: true,
      secureContext,
      secureContextRefreshInterval: 1000 * 60 * 60 * 24,
    };
  }

  const server = await RpcServer.startWithDefaults(options);

  // tslint:disable-next-line:no-console
  console.log(server + '');
};

// tslint:disable-next-line no-console
main().catch(console.error);
