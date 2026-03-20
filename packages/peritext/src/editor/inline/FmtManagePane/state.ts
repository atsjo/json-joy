import {SavedFmt} from '../../state/formattings';
import {SynthFmt} from '../../state/formattings/SynthFmt';
import {Slice} from 'json-joy/lib/json-crdt-extensions/peritext/slice/Slice';
import {JsonCrdtDiff} from 'json-joy/lib/json-crdt-diff/JsonCrdtDiff';
import * as rx from 'json-joy/lib/util/events/sync-store';
import type {Inline} from 'json-joy/lib/json-crdt-extensions';
import type {EditorState} from '../../state';

export class FormattingManageState {
  public readonly selected = rx.val<SavedFmt | null>(null);
  public readonly view = rx.val<'view' | 'edit'>('view');
  public readonly editing = rx.val<SynthFmt | undefined>(undefined);

  public constructor(
    public readonly state: EditorState,
    public readonly inline: Inline | undefined,
  ) {}

  public getFormattings$(inline: Inline | undefined = this.inline): rx.Computed<SavedFmt[]> {
    const state = this.state;
    const computed = rx.comp([state.surface.render$], () => {
      const slices = inline?.p1.layers;
      const res: SavedFmt[] = [];
      if (!slices) return res;
      const registry = state.txt.editor.getRegistry();
      for (const slice of slices) {
        if (slice.isMarker()) continue;
        if (!slice.isSaved()) continue;
        const tag = slice.type();
        if (typeof tag !== 'number' && typeof tag !== 'string') continue;
        const behavior = registry.get(tag);
        if (!behavior) continue;
        const isConfigurable = !!behavior.schema;
        if (!isConfigurable) continue;
        if (!(slice instanceof Slice)) continue;
        res.push(new SavedFmt(behavior, slice, state));
      }
      return res;
    });
    return computed;
  }

  public readonly select = (formatting: SavedFmt | null) => {
    this.selected.next(formatting);
  };

  public readonly switchToViewPanel = (): void => {
    this.view.next('view');
    this.editing.next(void 0);
  };

  public readonly switchToEditPanel = (): void => {
    const selected = this.selected.value;
    if (!selected) return;
    this.view.next('edit');
    const formatting = new SynthFmt(selected);
    this.editing.next(formatting);
  };

  public readonly returnFromEditPanelAndSave = (): void => {
    const shadowFormatting = this.editing.value;
    if (!shadowFormatting) return;
    const view = shadowFormatting.conf()!.view();
    const formatting = shadowFormatting.saved;
    const data = formatting.conf();
    if (!data) return;
    // if (!data) {
    //   // Slice has no stored data node (e.g. plain-toggle marks like math).
    //   // The Edit component is responsible for its own save; just close the panel.
    //   this.switchToViewPanel();
    //   this.state.surface.rerender();
    //   return;
    // }
    const model = data.api.model;
    const patch = new JsonCrdtDiff(model).diff(data.node, view);
    if (patch.ops.length) model.applyPatch(patch);
    this.switchToViewPanel();
    this.state.surface.rerender();
  };
}
