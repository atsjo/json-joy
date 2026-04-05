export type RpcSpecifier = RpcSpecifierRx | RpcSpecifierJson2;
export type RpcSpecifierRx = `rpc.rx.${'binary' | 'compact'}.${RpcSpecifierEncoding}`;
export type RpcSpecifierJson2 = `rpc.json2.verbose.${RpcSpecifierEncoding}`;
export type RpcSpecifierEncoding = 'cbor' | 'json' | 'msgpack';
