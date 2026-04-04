import type {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import type {RpcMessageCodecs} from './RpcMessageCodecs';

/** Aggregates all message and value codecs. */
export class RpcCodecs {
  constructor(
    public readonly val: Codecs,
    public readonly msg: RpcMessageCodecs,
  ) {}
}
