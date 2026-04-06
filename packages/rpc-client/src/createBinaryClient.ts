import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {RpcCodec} from '@jsonjoy.com/rpc-codec/lib/RpcCodec';
import {RxBinaryMessageCodec} from '@jsonjoy.com/rpc-codec-binary/lib/RxBinaryMessageCodec';
import {createClient} from './createClient';

/**
 * Constructs a JSON Reactive RPC client.
 *
 * ```typescript
 * const client = createBinaryClient('wss://api.host.com', 'token');
 * ```
 *
 * @param url RPC endpoint.
 * @param token Authentication token.
 * @returns An RPC client.
 */
export const createBinaryClient = (url: string, token?: string) => {
  const writer = new Writer(1024 * 4);
  const msg = new RxBinaryMessageCodec();
  const val = new CborJsonValueCodec(writer);
  const codec = new RpcCodec(msg, val, val);
  return createClient(codec, url, token);
};
