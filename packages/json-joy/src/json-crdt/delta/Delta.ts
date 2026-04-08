import {printTree} from 'tree-dump';
import type {IClockVector} from '../../json-crdt-patch';
import type {Printable} from 'tree-dump/lib/types';
import type {JsonCrdtOperation} from '../../json-crdt-patch/operations';
import type {Model} from '../model';

/**
 * Represents a single operation in a delta group. Conveniently, this is the
 * same as a JSON CRDT Patch operation, so we can directly apply these to the Model.
 */
export type DeltaMutator = JsonCrdtOperation;

/**
 * Represents a *Delta Group* - a missing state fragment that can be applied to
 * a CRDT state of another peer to "fill in" the missing state.
 */
export class Delta implements Printable {
  public static make(model: Model<any>, cc: IClockVector, ops: DeltaMutator[] = []): Delta {
    model.root.delta(model, cc, ops);
    // const index = model.index;
    // const iterator = index.iterator0();
    // while (true) {
    //   const next = iterator();
    //   if (!next) break;
    // }
    return new Delta(cc, ops);
  }

  constructor(
    /**
     * The *Causal Context* - version vector of the start of the delta. I.e. this
     * is usually what the other peer sends to us, this is what the other peer has
     * incorporated in their state.
     */
    public readonly cc: IClockVector,

    /**
     * A list of *Delta Mutators* (operations) in the delta group. MUST be applied
     * in order.
     */
    public readonly ops: DeltaMutator[] = [],
  ) {}

  // ---------------------------------------------------------------- Printable

  /**
   * Returns a textual human-readable representation of the delta. This can be
   * used for debugging purposes.
   *
   * @param tab Start string for each line.
   * @returns Text representation of the delta.
   */
  public toString(tab: string = ''): string {
    return 'Delta' + printTree(tab, [
      (tab: string) => this.cc.toString(tab),
      ...this.ops.map((op) => (tab: string) => op.toString(tab)),
    ]);
  }
}
