import {Callee} from '../../callee';
import {createRpcCallee, SampleCtx} from '../../callee/__tests__/Callee.fixtures';
import {Procedures} from '../../procedures';
import {BatchDispatcher} from '../BatchDispatcher';

export const createBatchDispatcher = () => {
  const ctx: SampleCtx = {ip: '127.0.0.1'};
  const callee = createRpcCallee<SampleCtx>() as Callee<SampleCtx, Procedures>;
  const dispatcher = new BatchDispatcher<SampleCtx>({callee});
  return {callee, dispatcher, ctx};
};
