import {SliceStacking, type TypeTag} from 'json-joy/lib/json-crdt-extensions';
import {BlockBehavior} from '../BlockBehavior';
import type {NodeBuilder} from 'json-joy/lib/json-crdt-patch';

export const block = <Tag extends TypeTag = TypeTag, Schema extends NodeBuilder = NodeBuilder>(
  tag: Tag,
  name: string,
  definition: Partial<BlockBehavior<Tag, Schema>>,
): BlockBehavior<Tag, Schema> => {
  const behavior = new BlockBehavior<Tag, Schema>(SliceStacking.Marker, tag, name);
  for (const key in definition) (behavior as any)[key] = (definition as any)[key];
  return behavior;
};
