import type * as msg from '@jsonjoy.com/rpc-messages';
import type {PhysicalChannelBase} from '@jsonjoy.com/channel';
import type {RpcCodec} from '@jsonjoy.com/rpc-codec';
import type {LogicalChannelBase} from './types';

type Incoming = msg.RxMessage;
type Outgoing = msg.RxMessage;

export class RxLogicalChannelBase implements LogicalChannelBase<Incoming[], Outgoing[]> {
  public onmsg: (msg: Incoming[]) => void = () => {};
  public onerr: (err: unknown) => void = () => {};
  public onclose?: (code: number, reason: string, wasClean: boolean) => void;

  constructor(
    private readonly channel: PhysicalChannelBase<Uint8Array>,
    private readonly codec: RpcCodec<msg.RxMessage>,
  ) {
    channel.onmessage = (data: Uint8Array) => {
      try {
        const messages = codec.decode(data) as Incoming[];
        this.onmsg(messages);
      } catch (error) {
        channel.close();
        this.onerr(error);
        return;
      }
    };
    channel.onclose = (code: number, reason: string, wasClean: boolean) => {
      this.onclose?.(code, reason, wasClean);
    };
  }

  public send(messages: Outgoing[]): void {
    const encoded = this.codec.encode(messages);
    this.channel.send(encoded);
  }

  public close(code?: number, reason?: string): void {
    this.channel.close(code, reason);
  }
}
