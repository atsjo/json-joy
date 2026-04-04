import {BinaryMsgStreamCodec} from '@jsonjoy.com/rpc-codec-binary/lib/BinaryMsgStreamCodec';
import {CompactMsgStreamCodec} from '@jsonjoy.com/rpc-codec-compact/lib/CompactMsgStreamCodec';
import {JsonRpc2TypedMsgStreamCodec} from '@jsonjoy.com/rpc-codec-json-rpc-2/lib/JsonRpc2TypedMsgStreamCodec';
import type {MsgStreamCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';

export class RpcMessageCodecs {
  binary: MsgStreamCodec;
  compact: MsgStreamCodec;
  jsonRpc2: MsgStreamCodec;

  constructor() {
    this.binary = new BinaryMsgStreamCodec();
    this.compact = new CompactMsgStreamCodec();
    this.jsonRpc2 = new JsonRpc2TypedMsgStreamCodec();
  }
}
