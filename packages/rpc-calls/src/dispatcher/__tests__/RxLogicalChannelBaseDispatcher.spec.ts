import {until} from "thingies";
import {unknown} from '@jsonjoy.com/json-type';
import {CompactMessageType} from "@jsonjoy.com/rpc-messages/lib/constants";
import type {CompactRequestCompleteMessage} from "@jsonjoy.com/rpc-messages";
import {
  RequestCompleteMessage,
  RequestDataMessage,
  NotificationMessage,
} from '@jsonjoy.com/rpc-messages';
import {createRxLogicalChannelBaseDispatcher} from "./RxLogicalChannelBaseDispatcher.fixtures";

describe('RxLogicalChannelBaseDispatcher', () => {
  test('can execute a basic RPC call', async () => {
    const {channel} = createRxLogicalChannelBaseDispatcher();
    const msg: CompactRequestCompleteMessage = [CompactMessageType.RequestComplete, 1, 'ping'];
    const uint8 = new TextEncoder().encode(JSON.stringify(msg));
    channel.simulateMessage(uint8);
    await until(() => channel.sentData.length === 1);
    const [uint8Back] = channel.sentData;
    const text = new TextDecoder().decode(uint8Back);
    const decoded = JSON.parse(text);
    expect(decoded).toEqual([[CompactMessageType.ResponseComplete, 1, 'pong']]);
  });

  describe('.onMessage', () => {
    test('can process a single "ping" call', async () => {
      const {dispatcher, ctx, channel} = createRxLogicalChannelBaseDispatcher();
      const msg = new RequestCompleteMessage(1, 'ping');
      dispatcher.onMessage(msg, ctx);
      await until(() => channel.sentData.length === 1);
      const [uint8] = channel.sentData;
      const text = new TextDecoder().decode(uint8);
      const decoded = JSON.parse(text);
      expect(decoded).toContainEqual([CompactMessageType.ResponseComplete, 1, 'pong']);
    });

    test('can process RequestDataMessage', async () => {
      const {dispatcher, ctx, channel} = createRxLogicalChannelBaseDispatcher();
      const msg = new RequestDataMessage(1, 'double', unknown({num: 5}));

      dispatcher.onMessage(msg, ctx);

      await until(() => channel.sentData.length === 1);
      const [uint8] = channel.sentData;
      const text = new TextDecoder().decode(uint8);
      const decoded = JSON.parse(text);
      expect(decoded).toContainEqual([CompactMessageType.ResponseComplete, 1, {num: 10}]);
    });

    test('handles validation errors', async () => {
      const {dispatcher, ctx, channel} = createRxLogicalChannelBaseDispatcher();
      const msg = new RequestDataMessage(1, 'double', unknown({invalidField: 'not a number'}));
      dispatcher.onMessage(msg, ctx);
      await until(() => channel.sentData.length === 1);
      const [uint8] = channel.sentData;
      const text = new TextDecoder().decode(uint8);
      const decoded = JSON.parse(text);
      expect(decoded[0][0]).toBe(CompactMessageType.ResponseError);
      expect(decoded[0][1]).toBe(1);
      expect(decoded[0][2]).toMatchObject({
        message: 'Payload .num field missing.',
        code: 'BAD_REQUEST',
      });
    });

    test('handles errors gracefully', async () => {
      const {dispatcher, ctx, channel} = createRxLogicalChannelBaseDispatcher();
      const msg = new RequestCompleteMessage(1, 'error');
      dispatcher.onMessage(msg, ctx);
      await until(() => channel.sentData.length === 1);
      const [uint8] = channel.sentData;
      const text = new TextDecoder().decode(uint8);
      const decoded = JSON.parse(text);
      expect(decoded[0][0]).toBe(CompactMessageType.ResponseError);
      expect(decoded[0][1]).toBe(1);
      expect(decoded[0][2]).toMatchObject({
        message: 'this promise can throw'
      });
    });
  });

  describe('.onMessages', () => {
    test('processes empty batch', () => {
      const {dispatcher, ctx} = createRxLogicalChannelBaseDispatcher();

      // Should not throw
      expect(() => dispatcher.onMessages([], ctx)).not.toThrow();
    });

    test('can process a simple message batch', async () => {
      const {dispatcher, ctx, channel} = createRxLogicalChannelBaseDispatcher();
      const messages = [
        new RequestCompleteMessage(1, 'ping'),
      ];
      dispatcher.onMessages(messages, ctx);
      await until(() => channel.sentData.length === 1);
      const [uint8] = channel.sentData;
      const text = new TextDecoder().decode(uint8);
      const decoded = JSON.parse(text);
      expect(decoded).toContainEqual([CompactMessageType.ResponseComplete, 1, 'pong']);
    });

    test('can send a notification', async () => {
      const {dispatcher, ctx, channel} = createRxLogicalChannelBaseDispatcher();
      dispatcher.onMessages([
        new NotificationMessage('notificationSetValue', unknown({value: 124})),
        new RequestCompleteMessage(1, 'getValue'),
      ], ctx);
      await until(() => channel.sentData.length > 0);
      const [uint8] = channel.sentData;
      const text = new TextDecoder().decode(uint8);
      const decoded = JSON.parse(text);
      expect(decoded).toEqual([[CompactMessageType.ResponseComplete, 1, {value: 124}]]);
    });

      test('sends complete message if observable immediately completes after emitting one value', async () => {
        const {dispatcher, ctx, channel} = createRxLogicalChannelBaseDispatcher();
        const msg = new RequestCompleteMessage(1, 'emitOnceSync');
        dispatcher.onMessage(msg, ctx);
        await until(() => channel.sentData.length === 1);
        const [uint8] = channel.sentData;
        const text = new TextDecoder().decode(uint8);
        const decoded = JSON.parse(text);
        // Should send ResponseComplete with the emitted value, not ResponseData + ResponseComplete
        expect(decoded).toContainEqual([CompactMessageType.ResponseComplete, 1, expect.any(String)]);
        expect(decoded.length).toBe(1);
      });

      test('observable emits three values synchronously', async () => {
        const {dispatcher, ctx, channel} = createRxLogicalChannelBaseDispatcher();
        const msg = new RequestDataMessage(1, 'emitThreeSync', unknown(null));
        dispatcher.onMessage(msg, ctx);
        const msg2 = new RequestCompleteMessage(1, '');
        dispatcher.onMessage(msg2, ctx);
        await until(() => channel.sentData.length === 1);
        const [uint8] = channel.sentData;
        const text = new TextDecoder().decode(uint8);
        const decoded = JSON.parse(text);
        expect(decoded).toEqual([
          [CompactMessageType.ResponseData, 1, 1],
          [CompactMessageType.ResponseData, 1, 2],
          [CompactMessageType.ResponseComplete, 1, 3],
        ]);
      });

      test('when promise completes with delay', async () => {
        const {dispatcher, ctx, channel} = createRxLogicalChannelBaseDispatcher();
        const msg = new RequestCompleteMessage(1, 'promiseDelay');
        dispatcher.onMessage(msg, ctx);
        await until(() => channel.sentData.length === 1);
        const [uint8] = channel.sentData;
        const text = new TextDecoder().decode(uint8);
        const decoded = JSON.parse(text);
        // Should send ResponseComplete with the result
        expect(decoded).toContainEqual([CompactMessageType.ResponseComplete, 1, {}]);
      });

      test('when observable completes with delay', async () => {
        const {dispatcher, ctx, channel} = createRxLogicalChannelBaseDispatcher();
        const msg = new RequestCompleteMessage(1, 'streamDelay');
        dispatcher.onMessage(msg, ctx);
        await until(() => channel.sentData.length === 1);
        const [uint8] = channel.sentData;
        const text = new TextDecoder().decode(uint8);
        const decoded = JSON.parse(text);
        // Should send ResponseComplete with the result after async delay
        expect(decoded).toContainEqual([CompactMessageType.ResponseComplete, 1, {}]);
      });
  });
});
