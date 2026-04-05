import {createRpcCallee} from '../../callee/__tests__/Callee.fixtures';
import {runCallerTests} from './runCallerTests';
import {RxPersistentCaller} from '../RxPersistentCaller';
import {LoopbackPhysicalChannel} from './LoopbackPhysicalChannel';
import {CompactStrBatchCodec} from '@jsonjoy.com/rpc-codec/lib/CompactStrBatchCodec';
import {firstValueFrom} from 'rxjs';
import {filter} from 'rxjs/operators';

const codec = new CompactStrBatchCodec();

runCallerTests(async () => {
  const callee = createRpcCallee();
  const ctx = {ip: '127.0.0.1'};
  const caller = new RxPersistentCaller({
    physical: {
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
