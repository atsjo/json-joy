import {createRpcCaller} from '../../callee/__tests__/Callee.fixtures';
import {runCallerTests} from './runCallerTests';
import {CalleeCaller} from '../CalleeCaller';

runCallerTests(async () => {
  const caller = createRpcCaller();
  const ctx = {ip: '127.0.0.1'};
  const client = new CalleeCaller(caller as any, ctx);
  return {caller: client, stop: async () => {} };
}, {
  skipValidationTests: true,
});
