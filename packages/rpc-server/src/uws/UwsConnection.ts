import type {WsConnection} from '../types';
import type {WebSocket} from './types-uws';

export class UwsConnection implements WsConnection {
  public closed: boolean = false;
  public onmessage?: (data: Uint8Array, isUtf8: boolean) => void;
  public onclose?: (code: number, reason: string, wasClean: boolean) => void;

  public ws: WebSocket | null = null;

  public close(code?: number, reason?: string): void {
    if (this.closed) return;
    const ws = this.ws;
    if (!ws) return;
    if (code !== undefined) {
      ws.end(code, reason);
    } else {
      ws.close();
    }
  }

  public send(data: Uint8Array): number {
    const ws = this.ws;
    if (!ws || this.closed) return 0;
    return ws.send(data, true, false);
  }

  public buffer(): number {
    const ws = this.ws;
    if (!ws) return 0;
    return ws.getBufferedAmount();
  }

  public sendPing(data: Uint8Array | null): void {
    const ws = this.ws;
    if (!ws || this.closed) return;
    ws.ping(data ?? undefined);
  }

  public sendPong(_data: Uint8Array | null): void {
    // uWS handles pong responses automatically
  }

  public sendBinMsg(data: Uint8Array): void {
    this.send(data);
  }

  public sendTxtMsg(txt: string): void {
    const ws = this.ws;
    if (!ws || this.closed) return;
    ws.send(txt, false, false);
  }
}
