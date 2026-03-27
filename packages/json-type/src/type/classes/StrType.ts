import {AbsType} from './AbsType';
import type * as schema from '../../schema';

export class StrType extends AbsType<schema.StrSchema> {
  public format(format: schema.StrSchema['format']): this {
    this.schema.format = format;
    return this;
  }

  public min(min: schema.StrSchema['min']): this {
    this.schema.min = min;
    return this;
  }

  public max(max: schema.StrSchema['max']): this {
    this.schema.max = max;
    return this;
  }
}
