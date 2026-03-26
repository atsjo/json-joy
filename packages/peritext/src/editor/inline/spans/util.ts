import {SliceStacking, type TypeTag} from 'json-joy/lib/json-crdt-extensions';
import {SpanBehavior} from '../SpanBehavior';
import type {CommandDefinition} from '../../state/commands/types';
import type {EditorState} from '../../state';

export const spanOne = <Tag extends TypeTag = TypeTag>(
  tag: Tag,
  name: string,
  definition: Partial<SpanBehavior>,
  // cmd?: Partial<CommandDefinition>,
): SpanBehavior<SliceStacking.One, Tag> => {
  const behavior = new SpanBehavior<SliceStacking.One, Tag>(SliceStacking.One, tag, name);
  for (const key in definition) (behavior as any)[key] = (definition as any)[key];
  const {menu, action} = behavior;
  if (menu && action) {
    behavior.cmd = (state: EditorState) => ({
      ...behavior.getMenu(state),
      action: action ? (state) => {
        action(state);
      } : undefined,
    } as CommandDefinition);
  }
  return behavior;
};
