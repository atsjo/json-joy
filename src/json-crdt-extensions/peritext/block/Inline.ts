import {printTree} from 'tree-dump/lib/printTree';
import {OverlayPoint} from '../overlay/OverlayPoint';
import {stringify} from '../../../json-text/stringify';
import {SliceBehavior} from '../slice/constants';
import {Range} from '../rga/Range';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';
import type {ChunkSlice} from '../util/ChunkSlice';
import type {Printable} from 'tree-dump/lib/types';
import type {PathStep} from '../../../json-pointer';
import type {Slice} from '../slice/types';

export type Marks = Record<string | number, unknown>;

export class Inline extends Range implements Printable {
  constructor(
    rga: AbstractRga<string>,
    public start: OverlayPoint,
    public end: OverlayPoint,
    
    /**
     * @todo PERF: for performance reasons, we should consider not passing in
     * this array. Maybe pass in just the initial chunk and the offset. However,
     * maybe even the just is not necessary, as the `.start` point should have
     * its chunk cached, or will have it cached after the first access.
     */
    public readonly texts: ChunkSlice[],
  ) {
    super(rga, start, end);
  }

  /**
   * @returns A stable unique identifier of this *inline* within a list of other
   *     inlines of the parent block. Can be used for UI libraries to track the
   *     identity of the inline across renders.
   */
  public key(): number | string {
    const start = this.start;
    const startId = this.start.id;
    const endId = this.end.id;
    const key = startId.sid.toString(36) + start.anchor + startId.time.toString(36) + endId.time.toString(36);
    return key;
  }

  public str(): string {
    let str = '';
    for (const slice of this.texts) str += slice.view();
    return str;
  }

  public marks(): Marks {
    const marks: Marks = {};
    const point = this.start as OverlayPoint;
    const slices: Slice[] = this.texts.length ? point.layers : point.markers;
    const length = slices.length;
    for (let i = 0; i < length; i++) {
      const slice = slices[i];
      const type = slice.type as PathStep;
      switch (slice.behavior) {
        case SliceBehavior.Stack: {
          let dataList: unknown[] = (marks[type] as unknown[]) || (marks[type] = []);
          if (!Array.isArray(dataList)) dataList = marks[type] = [dataList];
          let data = slice.data();
          if (data === undefined) data = 1;
          dataList.push(data);
          break;
        }
        case SliceBehavior.Overwrite: {
          let data = slice.data();
          if (data === undefined) data = 1;
          marks[type] = data;
          break;
        }
        case SliceBehavior.Erase: {
          delete marks[type];
          break;
        }
      }
    }
    return marks;
  }

  public pos(): number {
    const chunkSlice = this.texts[0];
    if (!chunkSlice) return -1;
    const chunk = chunkSlice.chunk;
    const pos = this.rga.pos(chunk);
    return pos + chunkSlice.off;
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const str = this.str();
    const truncate = str.length > 32;
    const text = JSON.stringify(truncate ? str.slice(0, 32) : str) + (truncate ? ' …' : '');
    const startFormatted = this.start.toString(tab, true);
    const range =
      this.start.cmp(this.end) === 0 ? startFormatted : `${startFormatted} ↔ ${this.end.toString(tab, true)}`;
    const header = `${this.constructor.name} ${range} ${text}`;
    const marks = this.marks();
    const markKeys = Object.keys(marks);
    return (
      header +
      printTree(tab, [
        !marks
          ? null
          : (tab) =>
              'attributes' +
              printTree(
                tab,
                markKeys.map((key) => () => key + ' = ' + stringify(marks[key])),
              ),
        !this.texts.length
          ? null
          : (tab) =>
              'texts' +
              printTree(
                tab,
                this.texts.map((text) => (tab) => text.toString(tab)),
              ),
      ])
    );
  }
}
