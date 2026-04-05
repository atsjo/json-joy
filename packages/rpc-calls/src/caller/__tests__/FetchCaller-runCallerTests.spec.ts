import {createRpcCallee} from '../../callee/__tests__/Callee.fixtures';
import {runCallerTests} from './runCallerTests';
import {FetchCaller} from '../FetchCaller';
import {CompactBinBatchCodec} from '@jsonjoy.com/rpc-codec/lib/CompactBinBatchCodec';
import {RequestCompleteMessage, NotificationMessage, ResponseCompleteMessage, ResponseErrorMessage, type RxServerMessage} from '@jsonjoy.com/rpc-messages';
import {unknown} from '@jsonjoy.com/json-type/lib/value/Value';

runCallerTests(
  async () => {
    const callee = createRpcCallee();
    const ctx = {ip: '127.0.0.1'};
    const codec = new CompactBinBatchCodec();
    const serializeError = (error: unknown): unknown => {
      if (error instanceof Error) {
        const obj: Record<string, unknown> = {message: error.message};
        for (const key of Object.keys(error)) obj[key] = (error as any)[key];
        return obj;
      }
      return error;
    };
    const mockFetch = async (_url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const body = init?.body;
      const incoming = new Uint8Array(body instanceof ArrayBuffer ? body : (body as any));
      const responses: RxServerMessage[] = [];
      const decodedMessages = codec.fromChunk(incoming);
      for (const message of decodedMessages) {
        if (message instanceof RequestCompleteMessage) {
          const id = message.id;
          const method = message.method as string;
          const request = message.value?.data;
          try {
            const result = await callee.call(method as any, request, ctx);
            responses.push(new ResponseCompleteMessage(id, unknown(result)));
          } catch (error) {
            responses.push(new ResponseErrorMessage(id, unknown(serializeError(error))));
          }
        }
        if (message instanceof NotificationMessage) {
          const method = message.method as string;
          const data = message.value?.data;
          callee.notify(method as any, data, ctx);
        }
      }
      const chunk = codec.toChunk(responses);
      return new Response(chunk as any, {status: 200, headers: {'Content-Type': 'application/octet-stream'}});
    };
    const caller = new FetchCaller({
      url: 'http://localhost:0/rpc',
      fetch: mockFetch as typeof fetch,
      codec,
      bufferTime: 1,
      headers: {'X-Custom': 'test'},
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
