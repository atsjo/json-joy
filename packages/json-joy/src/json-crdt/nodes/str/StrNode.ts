import {IClockVector, type ITimestampStruct, tick, tss} from '../../../json-crdt-patch/clock';
import {AbstractRga, type Chunk} from '../rga/AbstractRga';
import {next} from 'sonic-forest/lib/util';
import {DelOp, InsStrOp} from '../../../json-crdt-patch';
import {ORIGIN} from '../../../json-crdt-patch/constants';
import type {JsonNode} from '..';
import type {Model} from '../../model';
import type {DeltaMutator} from '../../delta/Delta';

/**
 * @ignore
 * @category CRDT Node
 */
export class StrChunk implements Chunk<string> {
  public readonly id: ITimestampStruct;
  public span: number;
  public del: boolean;
  public data: string;
  public len: number;
  public p: StrChunk | undefined;
  public l: StrChunk | undefined;
  public r: StrChunk | undefined;
  public p2: StrChunk | undefined;
  public l2: StrChunk | undefined;
  public r2: StrChunk | undefined;
  public s: StrChunk | undefined;

  constructor(id: ITimestampStruct, span: number, str: string) {
    this.id = id;
    this.span = span;
    this.len = str ? span : 0;
    this.del = !str;
    this.p = undefined;
    this.l = undefined;
    this.r = undefined;
    this.p2 = undefined;
    this.l2 = undefined;
    this.r2 = undefined;
    this.s = undefined;
    this.data = str;
  }

  public merge(str: string) {
    this.data += str;
    this.span = this.data.length;
  }

  public split(ticks: number): StrChunk {
    if (!this.del) {
      const chunk = new StrChunk(tick(this.id, ticks), this.span - ticks, this.data.slice(ticks));
      this.data = this.data.slice(0, ticks);
      this.span = ticks;
      return chunk;
    }
    const chunk = new StrChunk(tick(this.id, ticks), this.span - ticks, '');
    this.span = ticks;
    return chunk;
  }

  public delete(): void {
    this.del = true;
    this.data = '';
  }

  /**
   * - `id`, `span`, `len`, `del`, `data`: copied, set by constructor
   * - `p`, `l`, `r`, `p2`, `l2`, `r2`, `s`: not copied, set when inserted into RGA
   */
  public clone(): StrChunk {
    const chunk = new StrChunk(this.id, this.span, this.data);
    return chunk;
  }

  public view(): string {
    return this.data;
  }
}

/**
 * Represents the `str` type in JSON CRDT. The `str` type is a RGA (Replicated
 * Growable Array) of UTF-16 code units.
 *
 * @category CRDT Node
 */
export class StrNode<T extends string = string> extends AbstractRga<string> implements JsonNode<string> {
  // ----------------------------------------------------------------- JsonNode

  /** @ignore */
  public children() {}

  /** @ignore */
  public child() {
    return undefined;
  }

  /** @ignore */
  public container(): JsonNode | undefined {
    return undefined;
  }

  /** @ignore */
  private _view: string = '';
  public view(): T {
    if (this._view) return this._view as T;
    let str = '';
    for (let chunk = this.first(); chunk; chunk = next(chunk))
      // TODO: Check if this optimization improves performance: if (!chunk.del) str += chunk.data;
      str += chunk.data;
    return (this._view = str) as T;
  }

  /** @ignore */
  public api: undefined | unknown = undefined;

  /** @ignore */
  public parent: JsonNode | undefined = undefined;

  public name(): string {
    return 'str';
  }

  /** @ignore */
  public clone(): StrNode<T> {
    const clone = new StrNode<T>(this.id);
    const count = this.count;
    if (!count) return clone;
    let chunk = this.first();
    clone.ingest(count, () => {
      const ret = chunk!.clone();
      chunk = this.next(chunk!);
      return ret!;
    });
    return clone;
  }
  
  /** @ignore */
  public delta(model: Model, cc: IClockVector, ops: DeltaMutator[]): void {
    const strId = this.id;
    const iterator = this.iterator();
    let lastChunk: ReturnType<typeof iterator> | undefined;
    while (true) {
      const chunk = iterator();
      if (!chunk) break;
      const {id, span} = chunk;
      if (chunk.del) ops.push(new DelOp(ORIGIN, strId, [tss(id.sid, id.time, span)]));
      else {
        const gap = cc.gap(tick(id, span - 1));
        if (gap > 0) {
          const offset = Math.max(0, span - gap);
          const data = chunk.data ?? '';
          if (!offset) {
            const ref = lastChunk ? tick(lastChunk.id, lastChunk.span - 1) : strId;
            ops.push(new InsStrOp(id, strId, ref, data));
          } else {
            const text = data.slice(offset);
            const ref = tick(id, offset - 1);
            ops.push(new InsStrOp(tick(id, offset), strId, ref, text));
          }
        }
      }
      lastChunk = chunk;
    }
  }

  // -------------------------------------------------------------- AbstractRga

  /** @ignore */
  public createChunk(id: ITimestampStruct, str: string | undefined): StrChunk {
    return new StrChunk(id, str ? str.length : 0, str || '');
  }

  /** @ignore */
  protected onChange(): void {
    this._view = '';
  }

  protected toStringName(): string {
    return this.name();
  }
}
