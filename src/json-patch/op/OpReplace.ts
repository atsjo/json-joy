import type {CompactReplaceOp, OPCODE_REPLACE} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import {OperationReplace} from '../types';
import {find, isObjectReference, isArrayReference, Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';
import type {IMessagePackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack';

/**
 * @category JSON Patch
 */
export class OpReplace extends AbstractOp<'replace'> {
  constructor(
    path: Path,
    public readonly value: unknown,
    public readonly oldValue: unknown,
  ) {
    super(path);
  }

  public op() {
    return 'replace' as 'replace';
  }

  public code() {
    return OPCODE.replace;
  }

  public apply(doc: unknown) {
    const ref = find(doc, this.path);
    if (ref.val === undefined) throw new Error('NOT_FOUND');
    if (isObjectReference(ref)) ref.obj[ref.key] = this.value;
    else if (isArrayReference(ref)) ref.obj[ref.key] = this.value;
    else doc = this.value;
    return {doc, old: ref.val};
  }

  public toJson(parent?: AbstractOp): OperationReplace {
    const json: OperationReplace = {
      op: 'replace',
      path: formatJsonPointer(this.path),
      value: this.value,
    };
    if (this.oldValue !== undefined) (json as any).oldValue = this.oldValue;
    return json;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactReplaceOp {
    const opcode: OPCODE_REPLACE = verbose ? 'replace' : OPCODE.replace;
    return this.oldValue === undefined
      ? [opcode, this.path, this.value]
      : [opcode, this.path, this.value, this.oldValue];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    const hasOldValue = this.oldValue !== undefined;
    encoder.encodeArrayHeader(hasOldValue ? 4 : 3);
    encoder.writer.u8(OPCODE.replace);
    encoder.encodeArray(this.path as unknown[]);
    encoder.encodeAny(this.value);
    if (hasOldValue) encoder.encodeAny(this.oldValue);
  }
}
