import type {PhysicalChannelBase} from '@jsonjoy.com/channel';

export class MockServerWebSocketChannel implements PhysicalChannelBase<Uint8Array> {
  public closed = false;
  public onmessage: (data: Uint8Array, isUtf8: boolean) => void = () => {};
  public onclose: (code: number, reason: string) => void = () => {};

  public sentData: Uint8Array[] = [];

  public close(code?: number, reason?: string): void {
    this.closed = true;
    this.onclose(code ?? 1000, reason ?? 'CLOSE');
  }

  /**
   * Sends an outgoing message to the channel immediately.
   *
   * @param data A message payload.
   * @returns Number of bytes buffered or -1 if channel is not ready.
   */
  send(data: Uint8Array): number {
    if (this.closed) return -1;
    this.sentData.push(data);
    return data.byteLength;
  }

  public write(buf: Uint8Array): void {
    this.send(buf);
  }

  buffer(): number {
    return 0;
  }

  public sendPing(data: Uint8Array | null): void {
    // Mock implementation
  }

  public sendPong(data: Uint8Array | null): void {
    // Mock implementation
  }

  public sendBinMsg(data: Uint8Array): void {
    this.write(data);
  }

  public sendTxtMsg(txt: string): void {
    const data = new TextEncoder().encode(txt);
    this.write(data);
  }

  // Test helper methods
  public simulateMessage(data: Uint8Array, isUtf8: boolean = false): void {
    if (!this.closed) {
      this.onmessage(data, isUtf8);
    }
  }

  public getLastSentData(): Uint8Array | undefined {
    return this.sentData[this.sentData.length - 1];
  }

  public getAllSentData(): Uint8Array[] {
    return [...this.sentData];
  }

  public clearSentData(): void {
    this.sentData = [];
  }
}
