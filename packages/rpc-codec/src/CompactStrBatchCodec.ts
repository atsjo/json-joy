import {stringify, parse} from '@jsonjoy.com/json-pack/lib/json-binary';
import {RpcMessageFormat} from '@jsonjoy.com/rpc-codec-base/lib/constants';
import {toMessage} from '@jsonjoy.com/rpc-codec-compact/lib/toMessage';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';
import type {StrBatchCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';
import type {CompactMessage} from '@jsonjoy.com/rpc-codec-compact/lib/types';

export class CompactStrBatchCodec implements StrBatchCodec<RxMessage> {
  id = 'str-rx-compact-lite';
  format = RpcMessageFormat.Compact;

  toChunk(messages: RxMessage[]): string {
    const json: CompactMessage[] = [];
    const length = messages.length;
    for (let i = 0; i < length; i++) json.push(messages[i].toCompact());
    return stringify(json);
  }

  fromChunk(chunk: string): RxMessage[] {
    const json = parse(chunk) as any[];
    return json.map((compact: any) => toMessage(compact));
  }
}
