import {cmds as rangeCommands} from './range';
import {DynamicCommandDefinition} from './types';
import type {EditorState} from '../EditorState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import type {MenuItem} from '../../types';

export class Commands implements UiLifeCycles {
  public readonly byName: Record<string, DynamicCommandDefinition> = {};
  public readonly range: DynamicCommandDefinition[] = []

  constructor(public readonly state: EditorState) {
  }

  public start() {
    for (const cmd of rangeCommands) this.register(cmd);
    return () => {};
  }

  public register(cmd: DynamicCommandDefinition) {
    const menu = cmd(this.state);
    this.byName[menu.cmd ?? menu.name] = cmd;
    if (menu.domain === 'range') this.range.push(cmd);
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

  public run(name: string, ...args: any[]): Promise<unknown> | unknown {
    const cmdDef = this.byName[name];
    if (!cmdDef) throw new Error(`Command not found: ${name}`);
    const cmd = cmdDef(this.state);
    return cmd.action(this.state, args);
  }
}
