import * as React from 'react';
import {type JsonNodeView, s, type SchemaToJsonNode} from 'json-joy/lib/json-crdt';
import {
  InlineAttrStack,
  SliceStacking,
  SliceTypeCon,
  type FromHtmlBehavior,
  type PeritextMlElement,
} from 'json-joy/lib/json-crdt-extensions';
import {SpanBehavior} from '../../SpanBehavior';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {behavior as col} from '../col';
import type {EditorState} from '../../../state/EditorState';

export const name = 'Background';
export const Icon = makeIcon({set: 'lucide', icon: 'paint-bucket'});

export const schema = s.obj({
  col: s.str<string>(''),
});

export type Data = JsonNodeView<SchemaToJsonNode<typeof schema>>;

const fromHtml: FromHtmlBehavior<SliceStacking.Many, SliceTypeCon.bg, typeof schema> = {
  bg: (jsonml) => {
    const attr = jsonml[1] || {};
    const data: Data = {
      col: attr.col ?? '',
    };
    return [SliceTypeCon.bg, {data, inline: true}] as PeritextMlElement<SliceTypeCon.bg, any, true>;
  },
};

export const behavior = new (class BgBehavior extends SpanBehavior<
  SliceStacking.Many,
  SliceTypeCon.bg,
  typeof schema
> {
  constructor() {
    super(SliceStacking.Many, SliceTypeCon.bg, name, schema, false, void 0, fromHtml);
  }

  public readonly menuId = 'fmt-artistic';
  public readonly menu = (state: EditorState) => ({
    name,
    order: 2,
    icon: () => <Icon width={16} height={16} />,
    onSelect: () => {
      state.startSliceConfig(SliceTypeCon.bg);
    },
  });
  
  public readonly text = (style: React.CSSProperties, attr: InlineAttrStack) => {
    const data = attr[attr.length - 1].slice.data();
    const color: string | undefined = typeof data === 'object' && data ? String((data as any).col) : void 0;
    if (color) style.backgroundColor = color;
  };

  public readonly validate = col.validate;
  public readonly previewText = col.previewText;
  public readonly renderIcon = col.renderIcon;
  public readonly Edit = col.Edit;
  public readonly View = col.View;
})();
