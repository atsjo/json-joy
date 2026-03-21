import * as React from 'react';
import {rule} from 'nano-theme';
import {useT} from 'use-t';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {useSyncStore} from '@jsonjoy.com/ui/lib/hooks/useSyncStore';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import type {EditProps} from '../../../InlineSliceBehavior';

import 'mathlive';
import 'mathlive/fonts.css';
import 'mathlive/static.css';

const blockClass = rule({
  minW: '320px',
  maxW: '800px',
});

const fieldWrapClass = rule({
  d: 'block',
  '& math-field': {
    w: '100%',
    bd: '1px solid rgba(128,128,128,.16)',
    bdrad: '6px',
  },
});

export const Edit: React.FC<EditProps> = ({formatting, onSave}) => {
  const [_t] = useT();
  const fieldRef = React.useRef<HTMLElement | null>(null);
  const tex = useSyncStore(formatting.str);

  return (
    <div className={blockClass}>
      <div className={fieldWrapClass}>
        {React.createElement('math-field', {
          ref: fieldRef,
          value: tex,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSave();
            }
          },
          onInput: () => {
            const el = fieldRef.current as any;
            if (!el) return;
            const newTex: string = el.value ?? '';
            formatting.str.next(newTex);
          },
        })}
      </div>
      <Space size={1} />
      <div>
        <MiniTitle literal>LaTeX</MiniTitle>
        <Space size={-3} />
        <Input multiline mono size={-2} value={tex} onChange={(v) => formatting.str.next(v)} />
      </div>
    </div>
  );
};
