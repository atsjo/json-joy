import {MsgCodecLogicalChannel} from "./MsgCodecLogicalChannel";
import type {BatchCodec} from "@jsonjoy.com/rpc-codec-base";
import type {PhysicalChannel} from '@jsonjoy.com/channel';
import type {RxMessage} from "@jsonjoy.com/rpc-messages";

export interface RxMsgCodecLogicalChannelOptions<Chunk extends string | Uint8Array> {
  codec: BatchCodec<Chunk, RxMessage>;
  channel: PhysicalChannel<Chunk>;
}

export class RxMsgCodecLogicalChannel<Chunk extends string | Uint8Array> extends MsgCodecLogicalChannel<Chunk, RxMessage> {}
