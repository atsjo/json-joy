import {JsonJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/json';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {RpcCodec} from '@jsonjoy.com/rpc-codec/lib/RpcCodec';
import {RxCompactMessageCodec} from '@jsonjoy.com/rpc-codec-compact';
import {createClient} from './createClient';

/**
 * Constructs a JSON Reactive RPC client.
 *
 * @param url RPC endpoint.
 * @param token Authentication token.
 * @returns An RPC client.
 */
export const createJsonClient = (url: string, token?: string) => {
  const writer = new Writer(1024 * 4);
  const msg = new RxCompactMessageCodec();
  const val = new JsonJsonValueCodec(writer);
  const codec = new RpcCodec(msg, val, val);
  return createClient(codec, url, token);
};
