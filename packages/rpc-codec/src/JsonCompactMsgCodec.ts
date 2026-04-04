import {stringify, parse} from '@jsonjoy.com/json-pack/lib/json-binary';
import {RpcMessageFormat} from '@jsonjoy.com/rpc-codec-base/lib/constants';
import {toMessage} from '@jsonjoy.com/rpc-codec-compact/lib/toMessage';
import type {RpcMessage} from '@jsonjoy.com/rpc-messages';
import type {TextMsgCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';
import type {CompactMessage} from '@jsonjoy.com/rpc-codec-compact/lib/types';

type Chunk = string;

export class JsonCompactMsgCodec implements TextMsgCodec<RpcMessage> {
  id = 'binary-json-compact-lite';
  format = RpcMessageFormat.Compact;

  toChunk(messages: RpcMessage[]): Chunk {
    const json: CompactMessage[] = [];
    const length = messages.length;
    for (let i = 0; i < length; i++) json.push(messages[i].toCompact());
    return stringify(json);
  }

  fromChunk(chunk: Chunk): RpcMessage[] {
    const json = parse(chunk) as any[];
    return json.map((compact: any) => toMessage(compact));
  }
}
