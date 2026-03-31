import {SliceStacking, type TypeTag} from 'json-joy/lib/json-crdt-extensions';
import {SpanBehavior} from '../SpanBehavior';
import type {CommandDefinition} from '../../state/commands/types';
import type {EditorState} from '../../state';

export const spanOne = <Tag extends TypeTag = TypeTag>(
  tag: Tag,
  name: string,
  definition: Partial<SpanBehavior>,
  partialCommand?: Partial<CommandDefinition>,
): SpanBehavior<SliceStacking.One, Tag> => {
  const behavior = new SpanBehavior<SliceStacking.One, Tag>(SliceStacking.One, tag, name);
  for (const key in definition) (behavior as any)[key] = (definition as any)[key];
  const {menu, action} = behavior;
  if (partialCommand) {
    const cmd = behavior.cmd = !behavior.cmd ? [] : Array.isArray(behavior.cmd) ? behavior.cmd : [behavior.cmd];
    cmd.push((state: EditorState) => {
      const menu = behavior.getMenu(state);
      return {
        ...menu,
        name,
        cmd: name,
        domain: 'range',
        action: (state) => {
          state.surface.headless.cmd.exec('FormatToggle', tag);
        },
      };
    });
  }
  return behavior;
};
