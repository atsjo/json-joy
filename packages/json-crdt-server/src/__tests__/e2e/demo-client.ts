import WebSocket from 'ws';
import {RxPersistentCaller} from '@jsonjoy.com/rpc-calls/lib/caller/RxPersistentCaller';
import {FetchCaller} from '@jsonjoy.com/rpc-calls/lib/caller/FetchCaller';
import {WebSocketChannel} from '@jsonjoy.com/channel/lib/WebSocketChannel';
import {RpcMessageFormat} from '@jsonjoy.com/rpc-codec-base/lib/constants';
import type {RpcCodec} from '@jsonjoy.com/rpc-codec';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';
import type {BinBatchCodec} from '@jsonjoy.com/rpc-codec-base';

const secure = true;
const host = 'demo-iasd8921ondk0.jsonjoy.com';
// const host = '127.0.0.1:8080';

/** Adapts an {@link RpcCodec} to the {@link BinBatchCodec} interface for use with {@link FetchCaller}. */
const rpcCodecToBinBatchCodec = (rpcCodec: RpcCodec<RxMessage>): BinBatchCodec<RxMessage> => ({
  id: rpcCodec.specifier(),
  format: rpcCodec.msg.format ?? RpcMessageFormat.Compact,
  toChunk: (messages: RxMessage[]) => rpcCodec.encode(messages, rpcCodec.req),
  fromChunk: (chunk: Uint8Array) => rpcCodec.decode(chunk, rpcCodec.res),
});

export const setupDemoServerPersistentClient = (codec: RpcCodec<RxMessage>) => {
  const url = `ws${secure ? 's' : ''}://${host}/rx`;
  const caller = new RxPersistentCaller({
    codec,
    physical: {
      newChannel: () =>
        new WebSocketChannel({
          newSocket: () => new WebSocket(url, [codec.specifier()]) as any,
        }),
    },
  });
  caller.start();
  const call = caller.call.bind(caller);
  const call$ = caller.call$.bind(caller);
  return {caller: caller as any, call, call$, stop: async () => void caller.stop()};
};

export const setupDemoServerFetchClient = (codec: RpcCodec<RxMessage>) => {
  const url = `http${secure ? 's' : ''}://${host}/rx`;
  const caller = new FetchCaller({
    url,
    codec: rpcCodecToBinBatchCodec(codec),
    headers: {
      'Content-Type': `application/x.${codec.specifier()}`,
    },
  });
  const call = caller.call.bind(caller);
  const call$ = caller.call$.bind(caller);
  return {caller: caller as any, call, call$, stop: async () => void caller.stop()};
};
