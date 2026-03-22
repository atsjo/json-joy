import * as React from 'react';
import {RenderInline} from './inline/RenderInline';
import {RenderDoc, type RenderDocProps} from './doc/RenderDoc';
import {text} from './inline/text';
import {RenderBlock} from './block/RenderBlock';
import {RenderCaret} from './cursor/caret/RenderCaret';
import {RenderFocus} from './cursor/focus/RenderFocus';
import type {DebugState} from '../plugins/debug/state';
import type {PeritextPlugin} from '../web/react/types';

const h = React.createElement;

export interface EditorPluginOpts {
  debug?: DebugState;
}

export class EditorPlugin implements PeritextPlugin {
  constructor(public readonly opts: EditorPluginOpts = {}) {}

  public readonly text: PeritextPlugin['text'] = text;
  public readonly inline: PeritextPlugin['inline'] = (props, children) => h(RenderInline, props as any, children);
  public readonly block: PeritextPlugin['block'] = (props, children) => h(RenderBlock, props as any, children);
  public readonly doc: PeritextPlugin['doc'] = (children, surface) =>
    h(RenderDoc, {children, surface, opts: this.opts} satisfies RenderDocProps);
  public readonly caret: PeritextPlugin['caret'] = (props, children) => h(RenderCaret, <any>props, children);
  public readonly focus: PeritextPlugin['focus'] = (props, children) => h(RenderFocus, <any>props, children);
}
