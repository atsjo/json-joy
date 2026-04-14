import {CalleeCaller} from '@jsonjoy.com/rpc-calls/lib/caller/CalleeCaller';
import {createCaller} from '@jsonjoy.com/json-crdt-server/lib/routes';
import {DemoServerRemoteHistory} from '../DemoServerRemoteHistory';

export const setup = () => {
  const {caller, services} = createCaller();
  const client = new CalleeCaller(caller.rpc as any, {} as any);
  const remote = new DemoServerRemoteHistory(client as any);

  return {
    services,
    caller,
    client,
    remote,
  };
};
