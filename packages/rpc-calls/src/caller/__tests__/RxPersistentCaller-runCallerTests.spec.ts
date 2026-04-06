import {createRpcCallee} from '../../testing/Callee.fixtures';
import {runCallerTests} from './runCallerTests';
import {RxPersistentCaller} from '../RxPersistentCaller';
import {LoopbackPhysicalChannel} from './LoopbackPhysicalChannel';
import {createCodecs} from '@jsonjoy.com/rpc-codec/lib/build';
import {Uint8Channel} from '@jsonjoy.com/channel/lib/Uint8Channel';
import {firstValueFrom} from 'rxjs';
import {filter} from 'rxjs/operators';
import {RpcCodec} from '@jsonjoy.com/rpc-codec';

runCallerTests(async () => {
  const callee = createRpcCallee();
  const ctx = {ip: '127.0.0.1'};
  const codecs = createCodecs();
  const codec = new RpcCodec(codecs.msg.compact, codecs.val.json, codecs.val.json);
  const caller = new RxPersistentCaller({
    physical: {
      newChannel: () => new Uint8Channel(new LoopbackPhysicalChannel(codec, callee as any, ctx)),
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
