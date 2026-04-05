import {RpcMessageFormat} from '@jsonjoy.com/rpc-codec-base/lib/constants';
import {CompactStrBatchCodec} from './CompactStrBatchCodec';
import type {BinBatchCodec} from '@jsonjoy.com/rpc-codec-base';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';

export class CompactBinBatchCodec implements BinBatchCodec<RxMessage> {
  id = 'bin-rx-compact-lite';
  format = RpcMessageFormat.Compact;

  private strCodec = new CompactStrBatchCodec();
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  toChunk(messages: RxMessage[]): Uint8Array {
    const str = this.strCodec.toChunk(messages);
    return this.encoder.encode(str);
  }

  fromChunk(chunk: Uint8Array): RxMessage[] {
    const str = this.decoder.decode(chunk);
    return this.strCodec.fromChunk(str);
  }
}
