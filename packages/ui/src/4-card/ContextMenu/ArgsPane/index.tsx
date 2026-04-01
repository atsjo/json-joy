import * as React from 'react';
import {useT} from 'use-t';
import {rule, theme} from 'nano-theme';
import {ContextPane} from '../ContextPane';
import {ContextHeader} from '../ContextHeader';
import {ContextSep} from '../ContextSep';
import {ContextPaneHeaderSep} from '../ContextPaneHeaderSep';
import {BasicButtonBack} from '../../../2-inline-block/BasicButton/BasicButtonBack';
import {Flex} from '../../../3-list-item/Flex';
import {Arg} from './Arg';
import {ArgsState} from './state';
import type {MenuItem, Param} from '../../StructuralMenu/types';

const footerClass = rule({
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  pad: '6px 16px',
  gap: '8px',
});

const submitBtnClass = rule({
  ...theme.font.ui2,
  fz: '12px',
  pad: '4px 12px',
  bdrad: '4px',
  bd: 'none',
  cur: 'pointer',
  col: '#fff',
  transition: 'opacity 0.15s',
  '&:disabled': {
    opacity: 0.4,
    cur: 'default',
  },
});

const hintClass = rule({
  ...theme.font.ui3,
  fz: '10px',
  col: theme.g(0.45),
  us: 'none',
});

const nameClass = rule({
  fz: '13px',
  pad: '0 0 0 4px',
});

export interface ArgsPaneProps {
  item: MenuItem;
  params: Param[];
  minWidth?: number;
  onSubmit: (args: Record<string, unknown>) => void;
  onCancel: () => void;
}

export const ArgsPane: React.FC<ArgsPaneProps> = ({item, params, onSubmit, onCancel, minWidth}) => {
  const [t] = useT();
  const state = React.useMemo(() => new ArgsState(params), []);
  const args = state.args.use();

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    },
    [onCancel],
  );

  const display = item.display?.() ?? t(item.name);

  return (
    <ContextPane style={{minWidth: minWidth ?? 220}} onKeyDown={handleKeyDown}>
      <ContextHeader compact>
        <Flex style={{alignItems: 'center'}}>
          <BasicButtonBack onClick={onCancel} />
          <span className={nameClass}>{display}</span>
        </Flex>
      </ContextHeader>
      <ContextPaneHeaderSep />
      <ContextSep />
      {params.map((arg, i) => (
        <>
          {i > 0 && <ContextSep line />}
          <Arg
            key={arg.name}
            param={arg}
            value={args[arg.id ?? arg.name]}
            onChange={(v) => state.setValue(arg.id ?? arg.name, v)}
            onSubmit={state.onSubmit}
            focus={i === 0}
          />
        </>
      ))}
      <ContextSep />
      <div className={footerClass}>
        <span className={hintClass}>Enter ↵</span>
        <button
          className={submitBtnClass}
          style={{background: theme.color.sem.blue[0]}}
          disabled={!state.canSubmit()}
          onClick={state.onSubmit}
        >
          {t('Apply')}
        </button>
      </div>
    </ContextPane>
  );
};
