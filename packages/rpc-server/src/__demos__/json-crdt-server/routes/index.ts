import {routes} from './routes';
import {RpcError} from '@jsonjoy.com/rpc-error';
import {Value} from '@jsonjoy.com/json-type';
import {TypedCallee} from '@jsonjoy.com/rpc-calls';
import {system} from './system';
import {ObjValue} from '@jsonjoy.com/json-type';
import {Services} from '../services/Services';
import {MemoryStore} from '../services/blocks/store/MemoryStore';
import {LevelStore} from '../services/blocks/store/level/LevelStore';
import {ClassicLevel} from 'classic-level';
import {TypedRpcError} from '@jsonjoy.com/rpc-calls/lib/callee/error/typed';
import type {Store} from '../services/blocks/store/types';
import type {RouteDeps} from './types';

export const createRouter = (services: Services) => {
  const router = ObjValue.new(system);
  const deps: RouteDeps = {
    services,
    router,
    system,
    t: system.t,
  };
  return routes(deps)(router);
};

// export type JsonCrdtServerRouterObject = ReturnType<typeof createRouter>;

export const createCaller = (services: Services = new Services()) => {
  const router = createRouter(services);
  const caller = new TypedCallee<any, typeof router>({
    router,
    wrapInternalError: (error: unknown) => {
      if (error instanceof Value) return error;
      if (error instanceof RpcError) return TypedRpcError.value(error);
      // tslint:disable-next-line:no-console
      console.error(error);
      return TypedRpcError.valueFrom(error);
    },
  });
  return {router, caller, services};
};

export const createServices = async () => {
  let store: Store = new MemoryStore();
  if (process.env.JSON_CRDT_STORE === 'level') {
    const path = process.env.JSON_CRDT_STORE_PATH || './db';
    const kv = new ClassicLevel<string, Uint8Array>(path, {valueEncoding: 'view'});
    await kv.open();
    store = new LevelStore(<any>kv);
  }
  const services = new Services({store});
  return services;
};
