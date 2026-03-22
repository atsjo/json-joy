import {SliceStacking, type TypeTag} from 'json-joy/lib/json-crdt-extensions';
import {SpanBehavior} from '../SpanBehavior';
import type {NodeBuilder} from 'json-joy/lib/json-crdt-patch';

export const spanOne = <
  Tag extends TypeTag = TypeTag,
  Schema extends NodeBuilder = NodeBuilder,
> (tag: Tag, name: string, definition: Partial<SpanBehavior>): SpanBehavior<SliceStacking.One, Tag> => {
  const behavior = new SpanBehavior<SliceStacking.One, Tag>(SliceStacking.One, tag, name);
  for (const key in definition) (behavior as any)[key] = (definition as any)[key];
  return behavior;
};
