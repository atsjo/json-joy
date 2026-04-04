import {EncodingFormat} from '@jsonjoy.com/json-pack/lib/constants';
import type {CompiledBinaryEncoder} from '../types';
import {CborCodegen} from './cbor/CborCodegen';
import {JsonCodegen} from './json/JsonCodegen';
import {MsgPackCodegen} from './msgpack/MsgPackCodegen';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {Type} from '../../type';

export const getEncoder = (codec: JsonValueCodec, type: Type): CompiledBinaryEncoder => {
  switch (codec.format) {
    case EncodingFormat.Cbor: {
      return CborCodegen.get(type);
    }
    case EncodingFormat.MsgPack: {
      return MsgPackCodegen.get(type);
    }
    case EncodingFormat.Json: {
      return JsonCodegen.get(type);
    }
    default:
      throw new Error('UNK_CODEC');
  }
};
