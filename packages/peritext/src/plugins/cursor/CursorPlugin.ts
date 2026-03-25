import * as React from 'react';
import {RenderCaret} from './RenderCaret';
import {RenderFocus} from './RenderFocus';
import {RenderAnchor} from './RenderAnchor';
import {RenderInline} from './RenderInline';
import {RenderDoc} from './RenderDoc';
import {HslColor} from '@jsonjoy.com/ui';
import {CursorConstants} from './constants';
import type {PeritextPlugin} from '../../web/react/types';

const h = React.createElement;

export interface CursorPluginOpts {
  caret?: HslColor;
  selection?: HslColor;
}

/**
 * Plugin which renders the main cursor and all other current user local
 * cursors.
 *
 * You can customize cursor colors with the following CSS variables:
 *
 * - `--caret-height`: The height of the caret.
 * - `--caret-color`: The color of the caret for the focused user.
 * - `--caret-color-blurred`: The color of the caret for unfocused users.
 * - `--selection-color`: The color of the selection for the focused user.
 * - `--selection-color-blurred`: The color of the selection for unfocused users.
 *
 * If {@link CursorPluginOpts} are provided, those will be used instead to
 * generate the colors.
 */
export class CursorPlugin implements PeritextPlugin {
  public readonly vars: Record<string, string>;

  constructor(public readonly opts: CursorPluginOpts = {}) {
    const {caret = new HslColor(222 / 360, 1, 0.48)} = opts;
    let {selection} = opts;
    if (!selection) {
      selection = caret?.copy();
      selection.bump(-0.055);
      selection.s = 0.93;
      selection.l = 0.88;
      selection.a = 0.8;
    }
    this.vars = {
      [CursorConstants.CaretHeight]: '1.8em',
      [CursorConstants.CaretColor]: caret + '',
      [CursorConstants.CaretColorBlurred]: 'rgba(127,127,127,.7)',
      [CursorConstants.SelectionColor]: selection + '',
      [CursorConstants.SelectionColorBlurred]: 'rgba(127,127,127,.2)',
    };
  }

  public readonly caret: PeritextPlugin['caret'] = (props, children) => h(RenderCaret, props as any, children);
  public readonly focus: PeritextPlugin['focus'] = (props, children) => h(RenderFocus, props as any, children);
  public readonly anchor: PeritextPlugin['anchor'] = (props, children) => h(RenderAnchor, props as any, children);
  public readonly inline: PeritextPlugin['inline'] = (props, children) => h(RenderInline, props as any, children);
  public readonly doc: PeritextPlugin['doc'] = (children, ctx) => h(RenderDoc, {children, ctx, opts: this.opts});
}
