import {createRpcCaller} from '../../callee/__tests__/Callee.fixtures';
import {runCallerTests} from './runCallerTests';
import {RxCaller} from '../RxCaller';
import {LoopbackChannel} from './LoopbackChannel';

runCallerTests(async () => {
  const callee = createRpcCaller();
  const ctx = {ip: '127.0.0.1'};
  const channel = new LoopbackChannel(callee as any, ctx);
  const caller = new RxCaller({channel});
  return {
    caller: caller as any,
    stop: async () => {
      caller.stop();
    },
  };
});
