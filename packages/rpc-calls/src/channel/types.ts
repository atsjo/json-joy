import type {Observable} from "rxjs";

export interface LogicalChannelBase<Incoming, Outgoing> {
  onmsg: (msg: Incoming) => void;
  onerr: (err: unknown) => void;
  onclose?: (code: number, reason: string, wasClean: boolean) => void;
  send(outgoing: Outgoing): void;
}

export interface LogicalChannel<Incoming, Outgoing> {
  msg$: Observable<Incoming>;
  err$: Observable<unknown>;
  send(outgoing: Outgoing): Promise<void>;
}
