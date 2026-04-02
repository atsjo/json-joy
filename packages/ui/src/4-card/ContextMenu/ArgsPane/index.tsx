import * as React from 'react';
import {useT} from 'use-t';
import {rule} from 'nano-theme';
import {ContextPane} from '../ContextPane';
import {ContextHeader} from '../ContextHeader';
import {ContextSep} from '../ContextSep';
import {ContextPaneHeaderSep} from '../ContextPaneHeaderSep';
import {BasicButtonBack} from '../../../2-inline-block/BasicButton/BasicButtonBack';
import {Flex} from '../../../3-list-item/Flex';
import {Arg} from './Arg';
import {ArgsState} from './state';
import {Button} from '../../../2-inline-block/Button';
import {BasicTooltip} from '../../BasicTooltip';
import type {MenuItem, Param} from '../../StructuralMenu/types';

const footerClass = rule({
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  pad: '4px 16px',
  gap: '8px',
});

const nameClass = rule({
  fz: '13px',
  pad: '0 0 0 4px',
});

export interface ArgsPaneProps {
  item: MenuItem;
  params: Param[];
  minWidth?: number;
  onCancel: () => void;
  onSubmit: (list: [string, unknown][], args: Record<string, unknown>) => void;
}

export const ArgsPane: React.FC<ArgsPaneProps> = (props) => {
  const {item, params, onCancel, minWidth} = props;
  const [t] = useT();
  const state = React.useMemo(() => new ArgsState(props), [props]);
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
          {i > 0 && (
            <>
              <ContextSep />
              <ContextSep line />
              <ContextSep />
            </>
          )}
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
      <ContextSep line />
      <ContextSep />
      <div className={footerClass}>
        <BasicTooltip shortcut="⏎" renderTooltip={() => 'Enter'}>
          <Button disabled={!state.canSubmit()} onClick={state.onSubmit}>
            {t('Apply')}
          </Button>
        </BasicTooltip>
      </div>
      <ContextSep />
    </ContextPane>
  );
};
