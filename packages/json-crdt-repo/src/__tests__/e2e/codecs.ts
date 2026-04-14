import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {RpcCodecs} from '@jsonjoy.com/rpc-codec/lib/RpcCodecs';
import {RpcMessageCodecs} from '@jsonjoy.com/rpc-codec/lib/RpcMessageCodecs';
import {RpcCodec} from '@jsonjoy.com/rpc-codec/lib/RpcCodec';

export interface SetupCodecsOpts {
  skipJson2?: boolean;
  onlyCommon?: boolean;
}

export const setupCodecs = (opts: SetupCodecsOpts = {}) => {
  const codecs = new RpcCodecs(new Codecs(new Writer() as any), new RpcMessageCodecs());
  const {binary, compact, jsonRpc2} = codecs.msg;
  const {json, cbor, msgpack} = codecs.val;
  const list: RpcCodec<any>[] = [
    new RpcCodec(compact, json, json),
    new RpcCodec(compact, cbor, cbor),
    new RpcCodec(binary, cbor, cbor),
  ];
  if (!opts.onlyCommon) {
    list.push(new RpcCodec(compact, msgpack, msgpack));
    list.push(new RpcCodec(compact, json, cbor));
    // list.push(new RpcCodec(compact, json, msgpack));
    // list.push(new RpcCodec(compact, cbor, json));
    // list.push(new RpcCodec(compact, cbor, msgpack));
    // list.push(new RpcCodec(compact, msgpack, json));
    // list.push(new RpcCodec(compact, msgpack, cbor));
    list.push(new RpcCodec(binary, msgpack, msgpack));
    list.push(new RpcCodec(binary, json, json));
    // list.push(new RpcCodec(binary, json, cbor));
    // list.push(new RpcCodec(binary, json, msgpack));
    // list.push(new RpcCodec(binary, cbor, json));
    // list.push(new RpcCodec(binary, cbor, msgpack));
    // list.push(new RpcCodec(binary, msgpack, json));
    // list.push(new RpcCodec(binary, msgpack, cbor));
    if (!opts.skipJson2) {
      list.push(new RpcCodec(jsonRpc2, json, json));
      list.push(new RpcCodec(jsonRpc2, cbor, cbor));
      list.push(new RpcCodec(jsonRpc2, msgpack, msgpack));
      // list.push(new RpcCodec(jsonRpc2, json, cbor));
      // list.push(new RpcCodec(jsonRpc2, json, msgpack));
      // list.push(new RpcCodec(jsonRpc2, cbor, json));
      // list.push(new RpcCodec(jsonRpc2, cbor, msgpack));
      // list.push(new RpcCodec(jsonRpc2, msgpack, json));
      // list.push(new RpcCodec(jsonRpc2, msgpack, cbor));
    }
  }
  return {
    codecs,
    list,
  };
};

export const cborCodec = () => {
  const codecs = new RpcCodecs(new Codecs(new Writer() as any), new RpcMessageCodecs());
  const {binary} = codecs.msg;
  const {cbor} = codecs.val;
  return new RpcCodec(binary, cbor, cbor);
};
