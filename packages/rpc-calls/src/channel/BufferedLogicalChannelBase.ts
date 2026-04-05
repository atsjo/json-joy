import {TimedQueue} from 'thingies';
import type {LogicalChannelBase} from './types';

export interface BufferedLogicalChannelBaseOptions<Incoming, Outgoing> {
  channel: LogicalChannelBase<Incoming[], Outgoing[]>;

  /**
   * Number of messages to keep in buffer before sending them to the server.
   * The buffer is flushed when the message reaches this limit or when the
   * buffering time has reached the time specified in `bufferTime` parameter.
   * Defaults to 100 messages.
   */
  bufferSize?: number;

  /**
   * Time in milliseconds for how long to buffer messages before sending them
   * to the server. Defaults to 10 milliseconds.
   */
  bufferTime?: number;
}

/**
 * Adds buffering capabilities to a {@link LogicalChannelBase}, where messages are
 * sent every {@link BufferedLogicalChannelBaseOptions.bufferTime} milliseconds or when the buffer
 * reaches {@link BufferedLogicalChannelBaseOptions.bufferSize} messages, whichever comes first.
 */
export class BufferedLogicalChannelBase<Incoming, Outgoing> implements LogicalChannelBase<Incoming[], Outgoing[]> {
  public onmsg: (msg: Incoming[]) => void = () => {};
  public onerr: (err: unknown) => void = () => {};
  public readonly buffer: TimedQueue<Outgoing>;
  private readonly channel: LogicalChannelBase<Incoming[], Outgoing[]>;

  constructor({channel, bufferSize = 100, bufferTime = 5}: BufferedLogicalChannelBaseOptions<Incoming, Outgoing>) {
    this.channel = channel;
    channel.onmsg = (msg: Incoming[]) => this.onmsg(msg);
    channel.onerr = (err: unknown) => this.onerr(err);
    this.buffer = new TimedQueue();
    this.buffer.itemLimit = bufferSize;
    this.buffer.timeLimit = bufferTime;
    this.buffer.onFlush = (list: Outgoing[]) => {
      channel.send(list);
    };
  }

  public send(outgoing: Outgoing[]): void {
    const buffer = this.buffer;
    const length = outgoing.length;
    for (let i = 0; i < length; i++) buffer.push(outgoing[i]);
  }

  public close(code?: number, reason?: string): void {
    this.channel.close(code, reason);
  }
}
