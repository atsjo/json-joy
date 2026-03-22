import * as React from 'react';
import {RenderInline} from './inline/RenderInline';
import {RenderDoc, type RenderDocProps} from './doc/RenderDoc';
import {RenderBlock} from './block/RenderBlock';
import {RenderCaret} from './cursor/caret/RenderCaret';
import {RenderFocus} from './cursor/focus/RenderFocus';
import type {DebugState} from '../plugins/debug/state';
import type {PeritextPlugin} from '../web/react/types';
import type {EditorState} from './state';

const h = React.createElement;

export interface EditorPluginOpts {
  debug?: DebugState;
}

export class EditorPlugin implements PeritextPlugin {
  public state?: EditorState = void 0;
  constructor(public readonly opts: EditorPluginOpts = {}) {}

  public readonly text: PeritextPlugin['text'] = (props, inline) => {
    const state = this.state;
    if (!state) return props;
    const style = (props.style || (props.style = {})) as React.CSSProperties;
    const attrs = inline.attr();
    const tags = Object.keys(attrs);
    const length = tags.length;
    if (length === 0) return;
    const {spanMap, spanOrder} = state;
    tags.sort((a, b) => (spanOrder[a] ?? 0) - (spanOrder[b] ?? 0));
    for (let i = 0; i < length; i++) {
      const behavior = spanMap[tags[i]];
      if (!behavior) continue;
      const attr = attrs[behavior.tag];
      if (!attr) continue;
      const formatText = behavior.text;
      formatText?.(style, attr, props, inline, state);
    }
    return props;
  };

  public readonly inline: PeritextPlugin['inline'] = (props, children) => h(RenderInline, props as any, children);
  public readonly block: PeritextPlugin['block'] = (props, children) => h(RenderBlock, props as any, children);
  public readonly doc: PeritextPlugin['doc'] = (children, surface) =>
    h(RenderDoc, {children, surface, opts: this.opts} satisfies RenderDocProps);
  public readonly caret: PeritextPlugin['caret'] = (props, children) => h(RenderCaret, <any>props, children);
  public readonly focus: PeritextPlugin['focus'] = (props, children) => h(RenderFocus, <any>props, children);
}
