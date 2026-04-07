import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {MessageCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';
import type {RpcSpecifier} from './types';

/**
 * Represents a single message and value request/response pair. Typically to be
 * used for a single HTTP request/response, or a connection over WebSocket or similar.
 */
export class RpcCodec<Message> {
  constructor(
    public readonly msg: MessageCodec<Message>,
    public readonly req: JsonValueCodec,
    public readonly res: JsonValueCodec,
  ) {}

  public specifier(): RpcSpecifier {
    const specifier = `rpc.${this.msg.id}.${this.req.id}` + (this.req.id !== this.res.id ? `-${this.res.id}` : '');
    return specifier as RpcSpecifier;
  }

  public encode(messages: Message[], valueCodec: JsonValueCodec = this.res): Uint8Array {
    return this.msg.encode(valueCodec, messages);
  }

  public decode(data: Uint8Array, valueCodec: JsonValueCodec = this.req): Message[] {
    return this.msg.decode(valueCodec, data);
  }
}
