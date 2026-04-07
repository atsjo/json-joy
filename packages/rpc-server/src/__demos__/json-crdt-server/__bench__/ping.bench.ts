// npx ts-node packages/rpc-server/src/__demos__/json-crdt-server/__bench__/ping.bench.ts

/* tslint:disable no-console */

import {Suite} from 'benchmark';
import {RxPersistentCaller} from '@jsonjoy.com/rpc-calls/lib/caller/RxPersistentCaller';
import {WebSocketChannel} from '@jsonjoy.com/channel/lib/WebSocketChannel';
import {CompactBinBatchCodec} from '@jsonjoy.com/rpc-codec/lib/CompactBinBatchCodec';
import {WebSocket} from 'ws';

const main = async () => {
  const codec = new CompactBinBatchCodec();
  const client = new RxPersistentCaller({
    codec,
    physical: {
      newChannel: () =>
        new WebSocketChannel({
          newSocket: () => new WebSocket('ws://localhost:9999/rx') as any,
        }),
    },
    ping: 0,
  });
  client.start();

  await client.call('util.ping', {}); // Warmup

  const suite = new Suite();
  suite
    .add('fetch', async () => {
      const res = await fetch('http://localhost:9999/ping', {keepalive: true});
      const pong = await res.text();
      if (pong !== '"pong"') throw new Error('Unexpected response');
    })
    .add('RxPersistentCaller', async () => {
      const res = await client.call('util.ping', {});
      if (res !== 'pong') throw new Error('Unexpected response');
    })
    .on('cycle', (event: any) => {
      console.log(String(event.target));
    })
    .on('complete', () => {
      console.log('Fastest is ' + suite.filter('fastest').map('name'));
    })
    .run({async: true});
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
