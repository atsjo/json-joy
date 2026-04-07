import type {PhysicalChannel, PhysicalChannelBase} from '../types';
import {WebSocketChannel} from '../WebSocketChannel';
import {WebSocketMock} from './WebSocketMock';
import {WebSocketMockServerConnection} from './WebSocketMockServerConnection';

export class ChannelTestingDuplex {
  public readonly client: () => PhysicalChannel<Uint8Array<any>>;
  public readonly server: PhysicalChannelBase<Uint8Array<any>>;

  constructor() {
    const serverConnection = new WebSocketMockServerConnection();
    this.client = () => {
      const ws = new WebSocketMock({connection: serverConnection});
      const channel = new WebSocketChannel<Uint8Array>({
        newSocket: () => ws,
      });
      ws.controller.open();
      return channel;
    };
    this.server = {
      closed: false,
      close: (code?: number, reason?: string): void => {},
      send: (data: Uint8Array): number => {
        serverConnection.outgoing$.next(data);
        return data.length;
      },
      buffer: (): number => {
        return 0;
      },
    };
    serverConnection.incoming$.subscribe((data) => {
      this.server.onmessage?.(data, false);
    });
  }
}
