import {createRpcCallee, SampleCtx} from '../../callee/__tests__/Callee.fixtures';
import {RxLogicalChannelBaseDispatcher} from '../RxLogicalChannelBaseDispatcher';
import {MockServerWebSocketChannel} from './MockServerWebSocketChannel';
import {RxLogicalChannelBase} from '../../channel/RxLogicalChannelBase';
import {BufferedLogicalChannelBase} from '../../channel/BufferedLogicalChannelBase';
import {RpcCodec} from '@jsonjoy.com/rpc-codec';
import {createCodecs} from '@jsonjoy.com/rpc-codec/lib/build';
import type {Callee} from '../../callee/types';

export const createRxLogicalChannelBaseDispatcher = () => {
  const callee = createRpcCallee<SampleCtx>();
  const channel = new MockServerWebSocketChannel();
  const codecs = createCodecs();
  // const codec = new RpcCodec(codecs.msg.binary, codecs.val.cbor, codecs.val.cbor);
  const codec = new RpcCodec(codecs.msg.compact, codecs.val.json, codecs.val.json);
  const rxMessageChannel = new RxLogicalChannelBase(channel, codec);
  const rxMessageChannelBuffered = new BufferedLogicalChannelBase({channel: rxMessageChannel});
  const ctx: SampleCtx = {ip: '1.2.3.4'};
  const dispatcher = new RxLogicalChannelBaseDispatcher<SampleCtx>(
    rxMessageChannelBuffered,
    callee as Callee<SampleCtx>,
    ctx,
  );
  return {callee, channel, dispatcher, ctx};
};
