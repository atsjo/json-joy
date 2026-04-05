import {BinaryMsgStreamCodec} from '@jsonjoy.com/rpc-codec-binary/lib/BinaryMsgStreamCodec';
import {CompactMsgStreamCodec} from '@jsonjoy.com/rpc-codec-compact/lib/CompactMsgStreamCodec';
import {JsonRpc2TypedMsgStreamCodec} from '@jsonjoy.com/rpc-codec-json-rpc-2/lib/JsonRpc2TypedMsgStreamCodec';
import type {StreamCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';

export class RpcMessageCodecs {
  binary: StreamCodec;
  compact: StreamCodec;
  jsonRpc2: StreamCodec;

  constructor() {
    this.binary = new BinaryMsgStreamCodec();
    this.compact = new CompactMsgStreamCodec();
    this.jsonRpc2 = new JsonRpc2TypedMsgStreamCodec();
  }
}
