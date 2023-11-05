import * as nodes from '../../../nodes';
import {ClockDecoder} from '../../../../json-crdt-patch/codec/clock/ClockDecoder';
import {ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {Model, UNDEFINED} from '../../../model/Model';
import {JsonCrdtDataType, ORIGIN, SESSION} from '../../../../json-crdt-patch/constants';

export class Decoder {
  protected time?: number;
  protected clockDecoder?: ClockDecoder;

  public decode(data: unknown[]): Model {
    const x = data[0];
    const isServerTime = typeof x === 'number';
    if (isServerTime) {
      this.time = x;
    } else {
      this.clockDecoder = ClockDecoder.fromArr(x as number[]);
    }
    const doc = isServerTime ? Model.withServerClock(x as number) : Model.withLogicalClock(this.clockDecoder!.clock);
    const val = data[1] ? this.decodeNode(doc, data[1]) : UNDEFINED;
    doc.root = new nodes.RootNode(doc, val.id);
    return doc;
  }

  protected ts(arr: unknown[], index: number): [ITimestampStruct, number] {
    const x = arr[index];
    if (typeof x === 'number') {
      if (x < 0) {
        const sessionIndex = -x;
        const timeDiff = arr[index + 1] as number;
        return [this.clockDecoder!.decodeId(sessionIndex, timeDiff), index + 2];
      } else {
        return [new Timestamp(SESSION.SERVER, this.time! - x), index + 1];
      }
    } else {
      const time = (x as [number])[0];
      switch (time) {
        case ORIGIN.time:
          return [ORIGIN, index + 1];
        default:
          return [new Timestamp(SESSION.SYSTEM, time), index + 1];
      }
    }
  }

  protected decodeNode(doc: Model, data: unknown): nodes.JsonNode {
    if (data instanceof Array) {
      switch (data[0]) {
        case JsonCrdtDataType.con:
          return this.decodeConst(doc, data);
        case JsonCrdtDataType.con + 10:
          return this.decodeConstId(doc, data);
        case JsonCrdtDataType.val:
          return this.decodeVal(doc, data);
        case JsonCrdtDataType.obj:
          return this.decodeObj(doc, data);
        case JsonCrdtDataType.vec:
          return this.decodeTup(doc, data);
        case JsonCrdtDataType.str:
          return this.decodeStr(doc, data);
        case JsonCrdtDataType.bin:
          return this.decodeBin(doc, data);
        case JsonCrdtDataType.arr:
          return this.decodeArr(doc, data);
      }
    }
    throw new Error('UNKNOWN_NODE');
  }

  protected decodeObj(doc: Model, data: unknown[]): nodes.ObjNode {
    const [id, index] = this.ts(data, 1);
    const obj = new nodes.ObjNode(doc, id);
    const length = data.length;
    for (let i = index; i < length; ) {
      const key = data[i] as string;
      const val = this.decodeNode(doc, data[++i]);
      obj.put(key, val.id);
      i++;
    }
    doc.index.set(id, obj);
    return obj;
  }

  protected decodeTup(doc: Model, data: unknown[]): nodes.VecNode {
    const [id, index] = this.ts(data, 1);
    const obj = new nodes.VecNode(doc, id);
    const length = data.length;
    const elements = obj.elements;
    for (let i = index; i < length; ) {
      const component = data[i++];
      if (!component) elements.push(undefined);
      else {
        const node = this.decodeNode(doc, component);
        elements.push(node.id);
      }
    }
    doc.index.set(id, obj);
    return obj;
  }

  protected decodeArr(doc: Model, data: unknown[]): nodes.ArrNode {
    const size = data[1] as number;
    const [id, index] = this.ts(data, 2);
    const obj = new nodes.ArrNode(doc, id);
    const self = this;
    let i = index;
    obj.ingest(size, () => {
      const [chunkId, idx] = self.ts(data, i);
      const content = data[idx];
      i = idx + 1;
      if (typeof content === 'number') return new nodes.ArrChunk(chunkId, content, undefined);
      const ids = (content as unknown[]).map((c) => this.decodeNode(doc, c).id);
      return new nodes.ArrChunk(chunkId, (content as string).length, ids);
    });
    doc.index.set(id, obj);
    return obj;
  }

  protected decodeStr(doc: Model, data: unknown[]): nodes.StrNode {
    const size = data[1] as number;
    const [id, index] = this.ts(data, 2);
    const node = new nodes.StrNode(id);
    const self = this;
    let i = index;
    node.ingest(size, () => {
      const [chunkId, idx] = self.ts(data, i);
      const content = data[idx];
      i = idx + 1;
      if (typeof content === 'number') return new nodes.StrChunk(chunkId, content, '');
      return new nodes.StrChunk(chunkId, (content as string).length, content as string);
    });
    doc.index.set(id, node);
    return node;
  }

  protected decodeBin(doc: Model, data: unknown[]): nodes.BinNode {
    const size = data[1] as number;
    const [id, index] = this.ts(data, 2);
    const node = new nodes.BinNode(id);
    const self = this;
    let i = index;
    node.ingest(size, () => {
      const [chunkId, idx] = self.ts(data, i);
      const content = data[idx];
      i = idx + 1;
      if (typeof content === 'number') return new nodes.BinChunk(chunkId, content, undefined);
      const buf = content as Uint8Array;
      return new nodes.BinChunk(chunkId, buf.length, buf);
    });
    doc.index.set(id, node);
    return node;
  }

  protected decodeVal(doc: Model, data: unknown[]): nodes.ValNode {
    const [id, index] = this.ts(data, 1);
    const child = this.decodeNode(doc, data[index]);
    const obj = new nodes.ValNode(doc, id, child.id);
    doc.index.set(id, obj);
    return obj;
  }

  protected decodeConst(doc: Model, data: unknown[]): nodes.ConNode {
    const [id, index] = this.ts(data, 1);
    const value = data[index];
    const obj = new nodes.ConNode(id, value);
    doc.index.set(id, obj);
    return obj;
  }

  protected decodeConstId(doc: Model, data: unknown[]): nodes.ConNode {
    const [id, index] = this.ts(data, 1);
    const val = this.ts(data, index)[0];
    const obj = new nodes.ConNode(id, val);
    doc.index.set(id, obj);
    return obj;
  }
}
