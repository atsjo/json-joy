import {RxBinaryStreamCodec} from '@jsonjoy.com/rpc-codec-binary';
import {RxCompactStreamCodec} from '@jsonjoy.com/rpc-codec-compact';
import {JsonRpc2StreamCodec} from '@jsonjoy.com/rpc-codec-json-rpc-2';
import type {StreamCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';

export class RpcMessageCodecs {
  binary: StreamCodec<RxMessage>;
  compact: StreamCodec<RxMessage>;
  jsonRpc2: StreamCodec<RxMessage>;

  constructor() {
    this.binary = new RxBinaryStreamCodec();
    this.compact = new RxCompactStreamCodec();
    this.jsonRpc2 = new JsonRpc2StreamCodec();
  }
}
