import {SliceStacking, type TypeTag} from 'json-joy/lib/json-crdt-extensions';
import {SpanBehavior} from '../SpanBehavior';
import type {DynamicCommandDefinition} from '../../state/commands/types';
import type {EditorState} from '../../state';

export const spanOne = <Tag extends TypeTag = TypeTag>(
  tag: Tag,
  name: string,
  definition: Partial<SpanBehavior>,
): SpanBehavior<SliceStacking.One, Tag> => {
  const behavior = new SpanBehavior<SliceStacking.One, Tag>(SliceStacking.One, tag, name);
  for (const key in definition) (behavior as any)[key] = (definition as any)[key];
  if (!behavior.action) behavior.action = (state: EditorState) => state.cmd?.run(name);
  if (!definition.cmd) {
    const cmd: DynamicCommandDefinition[] = behavior.cmd = [];
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
