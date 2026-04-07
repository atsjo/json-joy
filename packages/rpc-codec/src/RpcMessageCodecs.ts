import {RxBinaryMessageCodec} from '@jsonjoy.com/rpc-codec-binary';
import {RxCompactMessageCodec} from '@jsonjoy.com/rpc-codec-compact';
import {JsonRpc2StreamCodec} from '@jsonjoy.com/rpc-codec-json-rpc-2';
import type {MessageCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';

export class RpcMessageCodecs {
  binary: MessageCodec<RxMessage>;
  compact: MessageCodec<RxMessage>;
  jsonRpc2: MessageCodec<RxMessage>;

  constructor() {
    this.binary = new RxBinaryMessageCodec();
    this.compact = new RxCompactMessageCodec();
    this.jsonRpc2 = new JsonRpc2StreamCodec();
  }
}
