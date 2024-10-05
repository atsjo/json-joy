import type {CompactTestTypeOp, OPCODE_TEST_TYPE} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationTestType, JsTypes, JsonPatchTypes} from '../types';
import {find, Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';
import {AbstractOp} from './AbstractOp';
import type {IMessagePackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack';

const {isArray} = Array;

/**
 * @category JSON Predicate
 */
export class OpTestType extends AbstractPredicateOp<'test_type'> {
  constructor(
    path: Path,
    public readonly type: JsonPatchTypes[],
  ) {
    super(path);
  }

  public op() {
    return 'test_type' as 'test_type';
  }

  public code() {
    return OPCODE.test_type;
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (val === null) return this.type.indexOf('null') > -1;
    if (isArray(val)) return this.type.indexOf('array') > -1;
    if (this.type.indexOf(typeof val as JsTypes) > -1) return true;
    if (typeof val === 'number' && val === Math.round(val) && this.type.indexOf('integer') > -1) return true;
    return false;
  }

  public toJson(parent?: AbstractOp): OperationTestType {
    const op: OperationTestType = {
      op: 'test_type',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      type: this.type,
    };
    return op;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactTestTypeOp {
    const opcode: OPCODE_TEST_TYPE = verbose ? 'test_type' : OPCODE.test_type;
    return [opcode, parent ? this.path.slice(parent.path.length) : this.path, this.type];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(3);
    encoder.writer.u8(OPCODE.test_type);
    encoder.encodeArray(parent ? this.path.slice(parent.path.length) : (this.path as unknown[]));
    encoder.encodeArray(this.type);
  }
}
