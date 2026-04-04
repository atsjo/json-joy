import {createRpcCaller} from '../../callee/__tests__/Callee.fixtures';
import {runCallerTests} from './runCallerTests';
import {UnaryCaller} from '../UnaryCaller';
import {CompactMessageType} from '@jsonjoy.com/rpc-messages/lib/constants';
import type {CompactClientMessage, CompactServerMessage} from '@jsonjoy.com/rpc-messages';

runCallerTests(
  async () => {
    const callee = createRpcCaller();
    const ctx = {ip: '127.0.0.1'};
    const caller = new UnaryCaller({
      bufferTime: 1,
      send: async (messages: CompactClientMessage[]): Promise<CompactServerMessage[]> => {
        const responses: CompactServerMessage[] = [];
        for (const message of messages) {
          const type = message[0];
          if (type === CompactMessageType.RequestComplete) {
            const id = message[1];
            const method = message[2] as string;
            const request = message[3];
            try {
              const result = await callee.call(method as any, request, ctx);
              responses.push([CompactMessageType.ResponseComplete, id, result] as CompactServerMessage);
            } catch (error) {
              responses.push([CompactMessageType.ResponseError, id, error] as CompactServerMessage);
            }
          }
          // Notifications don't produce responses.
          if (type === CompactMessageType.Notification) {
            const method = message[1] as string;
            const data = message[2];
            callee.notify(method as any, data, ctx);
          }
        }
        return responses;
      },
    });
    return {
      caller: caller as any,
      stop: async () => {
        caller.stop();
      },
    };
  },
  {
    skipStreamingTests: true,
  },
);
