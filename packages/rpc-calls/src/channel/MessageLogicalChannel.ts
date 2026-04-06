import {Subject, type Observable} from 'rxjs';
import type {RpcCodec} from '@jsonjoy.com/rpc-codec';
import type {PhysicalChannel} from '@jsonjoy.com/channel';
import type {LogicalChannel} from './types';

export class MessageLogicalChannel<Message> implements LogicalChannel<Message[], Message[]> {
  public readonly msg$: Observable<Message[]> = new Subject<Message[]>();
  public readonly err$: Observable<unknown>;

  constructor(
    private channel: PhysicalChannel<Uint8Array>,
    private codec: RpcCodec<Message>,
  ) {
    const subscription = channel.message$.subscribe({
      next: (chunk) => {
        const messages = codec.decode(chunk);
        (this.msg$ as Subject<Message[]>).next(messages);
      },
      error: () => {
        subscription?.unsubscribe();
      },
    });
    this.err$ = channel.error$;
  }

  public async send(outgoing: Message[]): Promise<void> {
    const buf = this.codec.encode(outgoing);
    this.channel.send(buf);
  }
}
