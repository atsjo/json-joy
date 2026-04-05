import type {RxMessage} from '@jsonjoy.com/rpc-messages';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {StreamCodec} from '@jsonjoy.com/rpc-codec-base/lib/types';
import type {RpcSpecifier} from './types';

/**
 * Represents a single message and value request/response pair. Typically to be
 * used for a single HTTP request/response, or a connection over WebSocket or similar.
 */
export class RpcCodec {
  constructor(
    public readonly msg: StreamCodec<RxMessage>,
    public readonly req: JsonValueCodec,
    public readonly res: JsonValueCodec,
  ) {}

  public specifier(): RpcSpecifier {
    const specifier = `rpc.${this.msg.id}.${this.req.id}` + (this.req.id !== this.res.id ? `-${this.res.id}` : '');
    return specifier as RpcSpecifier;
  }

  public encode(messages: RxMessage[]): Uint8Array {
    const encoder = this.req.encoder;
    const writer = encoder.writer;
    writer.reset();
    this.msg.writeBatch(this.req, messages);
    return writer.flush();
  }

  public decode(data: Uint8Array, valueCodec: JsonValueCodec): RxMessage[] {
    const decoder = valueCodec.decoder;
    const reader = decoder.reader;
    reader.reset(data);
    return this.msg.readChunk(valueCodec, data);
  }
}
