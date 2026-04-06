import {RxPersistentCaller} from '@jsonjoy.com/rpc-calls/lib/caller/RxPersistentCaller';
import {WebSocketChannel} from '@jsonjoy.com/channel/lib/WebSocketChannel';
import type {RpcCodec} from '@jsonjoy.com/rpc-codec';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';

export const createClient = (codec: RpcCodec<RxMessage>, url: string, token?: string): RxPersistentCaller => {
  const protocols: string[] = [codec.specifier()];
  if (token) protocols.push(token);
  const client = new RxPersistentCaller({
    codec,
    physical: {
      newChannel: () =>
        new WebSocketChannel({
          newSocket: () => new WebSocket(url, protocols),
        }),
    },
  });
  client.start();
  return client;
};
