import type {MenuItem} from "../../types";
import type {EditorState} from "../EditorState";

export interface CommandDefinition extends MenuItem {
  /** Technical name of the command, if not specified, the name will be used. */
  cmd?: string;
  /** Optional arguments for the command. */
  args?: CommandArgDefinition[];
  /** Domain where command operates. */
  domain?: CommandDomain;
  /** Human-readable name of the command. */
  name: string;
  /** Optional description of the command for UI display. */
  description?: string;
  /** The function to execute when the command is invoked. */
  action: (state: EditorState, args: string[]) => Promise<unknown> | unknown;
  /** Keyboard shortcut key combination. */
  keys?: string[];
  /** Whether this action is potentially dangerous. */
  danger?: boolean;
  /** Group this command belongs to when rendering context menu, potentially nested. */
  group?: string[];
}

export interface CommandArgDefinition {
  title: string;
  kind: 'str' | 'num' | 'bool';
}

export type CommandDomain =
  /** Command operates on the entire document. */
  | 'doc'
  /** Command operations on a range selection, e.g. flip selection. */
  | 'range';
