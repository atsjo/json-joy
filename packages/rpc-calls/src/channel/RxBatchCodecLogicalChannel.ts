import {BatchCodecLogicalChannel} from "./BatchCodecLogicalChannel";
import type {BatchCodec} from "@jsonjoy.com/rpc-codec-base";
import type {PhysicalChannel} from '@jsonjoy.com/channel';
import type {RxMessage} from "@jsonjoy.com/rpc-messages";

export interface RxBatchCodecLogicalChannelOptions<Chunk extends string | Uint8Array> {
  codec: BatchCodec<Chunk, RxMessage>;
  channel: PhysicalChannel<Chunk>;
}

export class RxBatchCodecLogicalChannel<Chunk extends string | Uint8Array> extends BatchCodecLogicalChannel<Chunk, RxMessage> {}
