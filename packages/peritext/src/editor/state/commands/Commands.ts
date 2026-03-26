import {cmds as rangeCommands} from './range';
import type {EditorState} from '../EditorState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import type {MenuItem} from '../../types';

export class Commands implements UiLifeCycles {
  public readonly range = [...rangeCommands];

  constructor (public readonly state: EditorState) {}

  public start() {
    return () => {};
  }

  public buildMenu(): MenuItem[] {
    const state = this.state;
    const menu: MenuItem[] = [];
    const commands = this.range;
    const length = commands.length;
    for (let i = 0; i < length; i++) {
      const item = commands[i](state);
      const {onSelect, action} = item;
      if (!onSelect && !!action) {
        item.onSelect = () => {
          action?.(this.state, []);
        };
      }
      menu.push(item);
    }
    return menu;
  }
}
