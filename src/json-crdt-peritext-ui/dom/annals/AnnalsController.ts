import {WebUndo} from './WebUndo';
import {printTree, type Printable} from 'tree-dump';
import type {Peritext} from '../../../json-crdt-extensions';
import type {UiLifeCycles} from '../types';
import type {Patch} from '../../../json-crdt-patch';
import type {RedoCallback, RedoItem, UndoCallback, UndoCollector, UndoItem} from '../../types';
import type {Log} from '../../../json-crdt/log/Log';
import type {PeritextEventTarget} from '../../events/PeritextEventTarget';

export interface UndoRedoControllerOpts {
  log: Log;
  txt: Peritext;
  et: PeritextEventTarget;
}

export class AnnalsController implements UndoCollector, UiLifeCycles, Printable {
  protected manager = new WebUndo();

  constructor(public readonly opts: UndoRedoControllerOpts) {}

  protected captured = new WeakSet<Patch>();

  /** ------------------------------------------------- {@link UndoCollector} */

  public capture(): void {
    const currentPatch = this.opts.txt.model.api.builder.patch;
    this.captured.add(currentPatch);
  }

  public undo(): void {
    this.manager.undo();
  }

  public redo(): void {
    this.manager.redo();
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start(): void {
    this.manager.start();
    const {opts, captured} = this;
    const {txt} = opts;
    txt.model.api.onFlush.listen((patch) => {
      const isCaptured = captured.has(patch);
      if (isCaptured) {
        captured.delete(patch);
        const item: UndoItem<Patch, Patch> = [patch, this._undo];
        this.manager.push(item);
      }
    });
  }

  public stop(): void {
    this.manager.stop();
  }

  public readonly _undo: UndoCallback<Patch, Patch> = (doPatch: Patch) => {
    const {log, et} = this.opts;
    const patch = log.undo(doPatch);
    et.dispatch('annals', {
      action: 'undo',
      batch: [patch],
    });
    // console.log('doPatch', doPatch + '');
    // console.log('undoPatch', patch + '');
    return [doPatch, this._redo] as RedoItem<Patch, Patch>;
  };

  public readonly _redo: RedoCallback<Patch, Patch> = (doPatch: Patch) => {
    const {log, et} = this.opts;
    const redoPatch = doPatch.rebase(log.end.clock.time);
    et.dispatch('annals', {
      action: 'redo',
      batch: [redoPatch],
    });
    // console.log('doPatch', doPatch + '');
    // console.log('redoPatch', redoPatch + '');
    return [redoPatch, this._undo] as RedoItem<Patch, Patch>;
  };

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return (
      'annals' +
      printTree(tab, [
        (tab) => 'undo: ' + this.manager.uStack.length,
        (tab) => 'redo: ' + this.manager.rStack.length,
      ])
    );
  }
}
