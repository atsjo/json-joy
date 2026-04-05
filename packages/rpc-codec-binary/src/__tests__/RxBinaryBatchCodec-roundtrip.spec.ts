import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {messages} from '@jsonjoy.com/rpc-messages/lib/testing/fixtures';
import {RxBinaryBatchCodec} from '../RxBinaryBatchCodec';

const cbor = new CborJsonValueCodec(new Writer());

describe('one message at a time', () => {
  for (const [name, msg] of Object.entries(messages)) {
    test(name, () => {
      const codec = new RxBinaryBatchCodec(cbor);
      const u8 = codec.toChunk([msg]);
      const [decoded] = codec.fromChunk(u8);
      expect(decoded.constructor).toBe(msg.constructor);
      expect((decoded as any).method).toBe((msg as any).method);
      expect((decoded as any).value?.data).toEqual((msg as any).value?.data);
    });
  }
});

describe('message batches', () => {
  const list = Object.values(messages);
  const length = list.length;
  for (let i = 0; i < length; i++) {
    const batch = list.slice(0, i + 1);
    test(`batch of ${i + 1} messages`, () => {
      const codec = new RxBinaryBatchCodec(cbor);
      const u8 = codec.toChunk(batch);
      const decoded = codec.fromChunk(u8);
      expect(decoded.length).toBe(batch.length);
      for (let j = 0; j < batch.length; j++) {
        const msg = batch[j];
        const d = decoded[j];
        expect(d.constructor).toBe(msg.constructor);
        expect((d as any).method).toBe((msg as any).method);
        expect((d as any).value?.data).toEqual((msg as any).value?.data);
      }
    });
  }
});
