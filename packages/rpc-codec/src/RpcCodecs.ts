import {RpcCodec} from './RpcCodec';
import {RpcSpecifier} from './types';
import {RpcError} from '@jsonjoy.com/rpc-error';
import type {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import type {RpcMessageCodecs} from './RpcMessageCodecs';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/src/codecs/types';
import type {MessageCodec} from '@jsonjoy.com/rpc-codec-base';

const REGEX_CODECS_SPECIFIER = /rpc\.(\w{0,32})\.(\w{0,32})\.(\w{0,32})(?:\-(\w{0,32}))?/;

/** Aggregates all message and value codecs. */
export class RpcCodecs {
  constructor(
    public readonly val: Codecs,
    public readonly msg: RpcMessageCodecs,
  ) {}

  /**
   * @param specifier A string which may contain a codec specifier. For example:
   *  - `rpc.rx.compact.cbor` for Rx-RPC with compact messages and CBOR values.
   *  - `rpc.json2.verbose.json` for JSON-RPC 2.0 with verbose messages encoded as JSON.
   */
  get(specifier: RpcSpecifier): RpcCodec<RxMessage> {
    const match = REGEX_CODECS_SPECIFIER.exec(specifier);
    if (!match) throw RpcError.codec();
    const [, protocol, messageFormat, request, response] = match;
    const {msg, val} = this;
    let msgCodec: MessageCodec<RxMessage> | undefined;
    let reqCodec: JsonValueCodec | undefined;
    let resCodec: JsonValueCodec | undefined;
    switch (protocol) {
      case 'rx': {
        switch (messageFormat) {
          case 'compact': {
            msgCodec = msg.compact;
            break;
          }
          case 'binary': {
            msgCodec = msg.binary;
            break;
          }
        }
        break;
      }
      case 'json2': {
        msgCodec = msg.jsonRpc2;
        break;
      }
    }
    switch (request) {
      case 'cbor': {
        resCodec = reqCodec = val.cbor;
        break;
      }
      case 'json': {
        resCodec = reqCodec = val.json;
        break;
      }
      case 'msgpack': {
        resCodec = reqCodec = val.msgpack;
        break;
      }
    }
    switch (response) {
      case 'cbor': {
        resCodec = val.cbor;
        break;
      }
      case 'json': {
        resCodec = val.json;
        break;
      }
      case 'msgpack': {
        resCodec = val.msgpack;
        break;
      }
    }
    if (!msgCodec || !reqCodec || !resCodec) throw RpcError.codec();
    return new RpcCodec(msgCodec, reqCodec, resCodec);
  }
}
