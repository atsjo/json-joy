import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {RpcCodecs} from '@jsonjoy.com/rpc-codec/lib/RpcCodecs';
import {RpcMessageCodecs} from '@jsonjoy.com/rpc-codec/lib/RpcMessageCodecs';
import type {RpcCodec} from '@jsonjoy.com/rpc-codec';
import type {RpcSpecifier} from '@jsonjoy.com/rpc-codec/lib/types';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';

export interface SetupCodecsOpts {
  skipJson2?: boolean;
  onlyCommon?: boolean;
}

const valCodecs = ['json', 'cbor', 'msgpack'] as const;
const msgFormats = ['rx.compact', 'rx.binary'] as const;

const createRpcCodecs = () => new RpcCodecs(new Codecs(new Writer()), new RpcMessageCodecs());

export const setupCodecs = (opts: SetupCodecsOpts = {}) => {
  const codecs = createRpcCodecs();
  const list: RpcCodec<RxMessage>[] = [];
  const seen = new Set<string>();
  const add = (specifier: string) => {
    if (seen.has(specifier)) return;
    seen.add(specifier);
    list.push(codecs.get(specifier as RpcSpecifier));
  };

  // Common codecs
  add('rpc.rx.compact.json');
  add('rpc.rx.compact.cbor');
  add('rpc.rx.binary.cbor');

  if (!opts.onlyCommon) {
    for (const fmt of msgFormats) {
      for (const req of valCodecs) {
        for (const res of valCodecs) {
          add(req === res ? `rpc.${fmt}.${req}` : `rpc.${fmt}.${req}-${res}`);
        }
      }
    }
    if (!opts.skipJson2) {
      for (const req of valCodecs) {
        for (const res of valCodecs) {
          add(req === res ? `rpc.json2.verbose.${req}` : `rpc.json2.verbose.${req}-${res}`);
        }
      }
    }
  }

  return {codecs, list};
};

/**
 * Returns only symmetric codecs (same value codec for req and res).
 * Use for WebSocket tests where the server uses the same codec in both directions.
 */
export const setupSymmetricCodecs = (opts: SetupCodecsOpts = {}) => {
  const codecs = createRpcCodecs();
  const list: RpcCodec<RxMessage>[] = [];
  const add = (specifier: string) => list.push(codecs.get(specifier as RpcSpecifier));

  for (const fmt of msgFormats) {
    for (const val of valCodecs) {
      add(`rpc.${fmt}.${val}`);
    }
  }
  if (!opts.skipJson2) {
    for (const val of valCodecs) {
      add(`rpc.json2.verbose.${val}`);
    }
  }

  return {codecs, list};
};

export const cborCodec = () => createRpcCodecs().get('rpc.rx.binary.cbor');
