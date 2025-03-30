import {tick} from '../../../../json-crdt-patch';
import {Anchor} from '../../../../json-crdt-extensions/peritext/rga/constants';
import type {Peritext} from '../../../../json-crdt-extensions';
import type {Point} from '../../../../json-crdt-extensions/peritext/rga/Point';
import type {Rect} from '../../../dom/types';
import type {PeritextUiApi, UiLineEdge, UiLineInfo} from './types';

export class UiHandle {
  constructor(
    public readonly txt: Peritext,
    public readonly api: PeritextUiApi,
  ) {}

  protected point(pos: number | Point<string>): Point<string> {
    return typeof pos === 'number' ? this.txt.pointAt(pos) : pos;
  }

  /**
   * Finds the position of the character at the given point (position between
   * characters). The first position has index of 0. Have to specify the
   * direction of the search, forward or backward.
   *
   * @param point The index of the character in the text, or a {@link Point}.
   * @param fwd Whether to find the location of the next character after the
   *     given {@link Point} or before, defaults to `true`.
   * @returns The bounding rectangle of the character at the given index.
   */
  public getPointRect(pos: number | Point<string>, right = true): Rect | undefined {
    const txt = this.txt;
    const point = typeof pos === 'number' ? txt.pointAt(pos) : pos;
    const char = right ? point.rightChar() : point.leftChar();
    if (!char) return;
    const id = tick(char.chunk.id, char.off);
    return this.api.getCharRect?.(id);
  }

  public pointX(pos: number | Point<string>): [x: number, rect: Rect] | undefined {
    const txt = this.txt;
    const point = typeof pos === 'number' ? txt.pointAt(pos) : pos;
    const rect = this.getPointRect(point, point.anchor === Anchor.Before ? true : false);
    if (!rect) return;
    const x = point.anchor === Anchor.Before ? rect.x : rect.x + rect.width;
    return [x, rect];
  }

  public findPointAtRelX(relX: number, line: UiLineInfo): Point<string> {
    const lineRect = line[0][1];
    const lineX = lineRect.x;
    let point = line[0][0].clone();
    let curr = point;
    let bestDiff = 1e9;
    const max = line[1][0].viewPos() - line[0][0].viewPos();
    if (!this.api.getCharRect) return point;
    for (let i = 0; i < max; i++) {
      const pointX = this.pointX(curr);
      if (!pointX) break;
      const [x] = pointX;
      const currRelX = x - lineX;
      const diff = Math.abs(currRelX - relX);
      if (diff <= bestDiff) {
        bestDiff = diff;
        point = curr.clone();
      } else break;
      curr.step(1);
    }
    return point;
  }

  public getLineEnd(pos: number | Point<string>, right = true): UiLineEdge | undefined {
    const startPoint = this.point(pos);
    const startRect = this.getPointRect(startPoint, right);
    if (!startRect) return;
    let curr = startPoint.clone();
    let currRect = startRect;
    const prepareReturn = (): UiLineEdge => {
      if (right) {
        curr.step(1);
        curr.refAfter();
      } else {
        curr.step(-1);
        curr.refBefore();
      }
      return [curr, currRect];
    };
    while (true) {
      const next = curr.copy(p => p.step(right ? 1 : -1));
      if (!next) return prepareReturn();
      const nextRect = this.getPointRect(next, right);
      if (!nextRect) return prepareReturn();
      if (right ? nextRect.x < currRect.x : nextRect.x > currRect.x) return prepareReturn();
      curr = next;
      currRect = nextRect;
    }
  }

  public getLineInfo(pos: number | Point<string>): UiLineInfo | undefined {
    const txt = this.txt;
    const point = this.point(pos);
    const isEndOfText = point.viewPos() === txt.strApi().length();
    if (isEndOfText) return;
    const left = this.getLineEnd(point, false);
    const right = this.getLineEnd(point, true);
    if (!left || !right) return;
    return [left, right];
  }

  public getPrevLineInfo(line: UiLineInfo): UiLineInfo | undefined {
    const [[left]] = line;
    if (left.isStart()) return;
    const point = left.copy(p => p.step(-1));
    return this.getLineInfo(point);
  }

  public getNextLineInfo(line: UiLineInfo): UiLineInfo | undefined {
    const [, [right]] = line;
    if (right.viewPos() >= this.txt.str.length()) return;
    const point = right.copy(p => p.step(1));
    return this.getLineInfo(point);
  }
}
