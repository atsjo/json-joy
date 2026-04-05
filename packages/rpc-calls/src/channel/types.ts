import type {Observable} from "rxjs";

export interface LogicalChannelBase<Incoming, Outgoing> {
  onmsg: (msg: Incoming) => void;
  onerr: (err: unknown) => void;
  onclose?: (code: number, reason: string, wasClean: boolean) => void;
  send(outgoing: Outgoing): void;
  
  /**
   * Closes the channel.
   *
   * @param code Closure code.
   * @param reason Closure reason.
   */
  close(code?: number, reason?: string): void;
}

export interface LogicalChannel<Incoming, Outgoing> {
  msg$: Observable<Incoming>;
  err$: Observable<unknown>;
  send(outgoing: Outgoing): Promise<void>;
}
