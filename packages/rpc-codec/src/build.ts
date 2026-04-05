import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {RpcCodecs} from './RpcCodecs';
import {RpcMessageCodecs} from './RpcMessageCodecs';

export const createCodecs = () => new RpcCodecs(new Codecs(new Writer()), new RpcMessageCodecs());
