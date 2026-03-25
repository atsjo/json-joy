import {cmds as rangeCommands} from './range';
import type {EditorState} from '../EditorState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

export class Commands implements UiLifeCycles {
  public readonly range = rangeCommands;

  constructor (public readonly state: EditorState) {}

  public start() {
    const commands = [...this.range];
    const length = commands.length;
    for (let i = 0; i < length; i++) {
      const cmd = commands[i];
      const {onSelect, action} = cmd;
      if (!onSelect && !!action) {
        cmd.onSelect = () => {
          action?.(this.state, []);
        };
      }
    }
    return () => {};
  }
}
