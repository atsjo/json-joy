import type {Observable} from "rxjs";

export interface LogicalChannelBase<Incoming, Outgoing> {
  onmsg: (msg: Incoming) => void;
  onerr: (err: unknown) => void;
  send(outgoing: Outgoing): Promise<void>;
}

export interface LogicalChannel<Incoming, Outgoing> {
  msg$: Observable<Incoming>;
  err$: Observable<unknown>;
  send(outgoing: Outgoing): Promise<void>;
}
