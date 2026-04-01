import type {MenuItem} from '../../types';
import type {EditorState} from '../EditorState';

export type DynamicCommandDefinition = (state: EditorState) => CommandDefinition;

export interface CommandDefinition extends MenuItem {
  /** Technical name of the command, if not specified, the name will be used. */
  cmd?: string;
  /** Domain where command operates. */
  domain?: CommandDomain;
  /** Human-readable name of the command. */
  name: string;
  /** The function to execute when the command is invoked. */
  action: (state: EditorState, args: string[]) => Promise<unknown> | unknown;
  /** Keyboard shortcut key combination. */
  keys?: string[];
  /** Whether this action is potentially dangerous. */
  danger?: boolean;
  /** Group this command belongs to when rendering context menu, potentially nested. */
  group?: string[];
}

export type CommandDomain =
  /** Command operates on the entire document. */
  | 'doc'
  /** Command operations on a range selection, e.g. flip selection. */
  | 'range';
