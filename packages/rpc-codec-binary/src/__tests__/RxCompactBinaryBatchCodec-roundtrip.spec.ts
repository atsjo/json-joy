import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {messages} from '@jsonjoy.com/rpc-messages/lib/testing/fixtures';
import {RxCompactBinaryBatchCodec} from '../RxCompactBinaryBatchCodec';
import {RxBinaryBatchCodec} from '../RxBinaryBatchCodec';

const cbor = new CborJsonValueCodec(new Writer());

describe('one compact message at a time', () => {
  for (const [name, message] of Object.entries(messages)) {
    test(name, () => {
      const compact = message.toCompact();
      const codec = new RxCompactBinaryBatchCodec(cbor);
      const u8 = codec.toChunk([compact]);
      const [decoded] = codec.fromChunk(u8);
      expect(decoded).toEqual(compact);
    });
  }
});

describe('wire compatibility with RxBinaryBatchCodec', () => {
  for (const [name, message] of Object.entries(messages)) {
    test(name, () => {
      const compact = message.toCompact();
      const compactCodec = new RxCompactBinaryBatchCodec(cbor);
      const rpcCodec = new RxBinaryBatchCodec(cbor);
      expect(compactCodec.fromChunk(rpcCodec.toChunk([message]))).toEqual([compact]);
      const [decodedRpc] = rpcCodec.fromChunk(compactCodec.toChunk([compact]));
      expect(decodedRpc.toCompact()).toEqual(compact);
    });
  }
});

describe('message batches', () => {
  const list = Object.values(messages);
  const length = list.length;
  for (let i = 0; i < length; i++) {
    test(`batch of ${i + 1} messages`, () => {
      const batch = list.slice(0, i + 1).map((message) => message.toCompact());
      const codec = new RxCompactBinaryBatchCodec(cbor);
      const u8 = codec.toChunk(batch);
      const decoded = codec.fromChunk(u8);
      expect(decoded).toEqual(batch);
    });
  }
});
