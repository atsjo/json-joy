import {createRpcCallee} from '../../callee/__tests__/Callee.fixtures';
import {runCallerTests} from './runCallerTests';
import {RxLogicalChannelCaller} from '../RxLogicalChannelCaller';
import {LoopbackChannel} from './LoopbackChannel';

runCallerTests(async () => {
  const callee = createRpcCallee();
  const ctx = {ip: '127.0.0.1'};
  const channel = new LoopbackChannel(callee as any, ctx);
  const caller = new RxLogicalChannelCaller({channel});
  return {
    caller: caller as any,
    stop: async () => {
      caller.stop();
    },
  };
});
