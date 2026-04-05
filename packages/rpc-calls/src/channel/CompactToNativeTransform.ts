import {map} from 'rxjs';
import {toMessage} from '@jsonjoy.com/rpc-messages';
import type {CompactMessage, RxMessage} from '@jsonjoy.com/rpc-messages';
import type {Observable} from 'rxjs';
import type {LogicalChannel} from './types';

export class CompactToNativeTransform implements LogicalChannel<CompactMessage[], CompactMessage[]> {
  public readonly msg$: Observable<CompactMessage[]>;
  public readonly err$: Observable<unknown>;

  constructor(protected readonly upstream: LogicalChannel<RxMessage[], RxMessage[]>) {
    this.err$ = upstream.err$;
    this.msg$ = upstream.msg$.pipe(
      map((messages) => {
        const compact: CompactMessage[] = [];
        const length = messages.length;
        for (let i = 0; i < length; i++) compact.push(messages[i].toCompact());
        return compact;
      }),
    );
  }

  public async send(outgoing: CompactMessage[]): Promise<void> {
    const native: RxMessage[] = [];
    const length = outgoing.length;
    for (let i = 0; i < length; i++) native.push(toMessage(outgoing[i]));
    return this.upstream.send(native);
  }
}
