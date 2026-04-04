import {createRpcCaller} from '../../callee/__tests__/Callee.fixtures';
import {runCallerTests} from './runCallerTests';
import {PersistentCaller} from '../PersistentCaller';
import {LoopbackPhysicalChannel} from './LoopbackPhysicalChannel';
import {JsonCompactMsgCodec} from '@jsonjoy.com/rpc-codec';
import {firstValueFrom} from 'rxjs';
import {filter} from 'rxjs/operators';

const codec = new JsonCompactMsgCodec();

runCallerTests(async () => {
  const callee = createRpcCaller();
  const ctx = {ip: '127.0.0.1'};
  const caller = new PersistentCaller({
    channel: {
      newChannel: () => new LoopbackPhysicalChannel(codec, callee as any, ctx),
    },
    codec,
    ping: 0,
  });
  caller.start();
  // Wait for the persistent channel to open and create the RxCaller.
  await firstValueFrom(caller.channel.open$.pipe(filter(Boolean)));
  return {
    caller: caller as any,
    stop: async () => {
      caller.stop();
    },
  };
});
