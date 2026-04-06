import {createRpcCallee} from '../../testing/Callee.fixtures';
import {runCallerTests} from './runCallerTests';
import {RxPersistentCaller} from '../RxPersistentCaller';
import {createCodecs} from '@jsonjoy.com/rpc-codec/lib/build';
import {ChannelTestingDuplex} from '@jsonjoy.com/channel/lib/testing/ChannelTestingDuplex';
import {firstValueFrom} from 'rxjs';
import {filter} from 'rxjs/operators';
import {RxLogicalChannelBaseDispatcher} from '../../dispatcher/RxLogicalChannelBaseDispatcher';
import {RxLogicalChannelBase} from '../../channel/RxLogicalChannelBase';
import {BufferedLogicalChannelBase} from '../../channel/BufferedLogicalChannelBase';

runCallerTests(async () => {
  const duplex = new ChannelTestingDuplex();
  const codecs = createCodecs();
  const codec = codecs.get('rpc.rx.compact.json');
  const callee = createRpcCallee();
  const ctx = {ip: '127.0.0.1'};
  const rxLogicalChannel = new RxLogicalChannelBase(duplex.server, codec);
  const rxLogicalChannelBuffered = new BufferedLogicalChannelBase({channel: rxLogicalChannel});
  const dispatcher = new RxLogicalChannelBaseDispatcher(rxLogicalChannelBuffered, callee as any, ctx);
  const caller = new RxPersistentCaller({
    physical: {
      newChannel: duplex.client,
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
