import * as React from 'react';
import {rule} from 'nano-theme';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {TextBlock} from '@jsonjoy.com/ui/lib/5-block/TextBlock';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {MathSpan} from '../mathlive';
import {convertLatexToAsciiMath, convertLatexToMathMl, convertLatexToMarkup} from 'mathlive';
import {ComputeEngine} from '@cortex-js/compute-engine';
import type {ViewProps} from '../../../SpanBehavior';

const ce = new ComputeEngine();

const blockClass = rule({
  minW: '320px',
  maxW: '800px',
  d: 'block',
  bxz: 'border-box',
  pd: '16px',
});

export const View: React.FC<ViewProps> = ({formatting, onEdit}) => {
  const tex = (formatting.range as unknown as {text(): string}).text?.() ?? '';
  const mathJson = React.useMemo(() => {
    try {
      return JSON.stringify(ce.parse(tex).toJSON());
    } catch {
      return '';
    }
  }, [tex]);
  const ascii = React.useMemo(() => {
    try {
      return convertLatexToAsciiMath(tex);
    } catch {
      return '';
    }
  }, [tex]);
  const mathMl = React.useMemo(() => {
    try {
      return convertLatexToMathMl(tex);
    } catch {
      return '';
    }
  }, [tex]);
  const mathHTML = React.useMemo(() => {
    try {
      return convertLatexToMarkup(tex);
    } catch {
      return '';
    }
  }, [tex]);

  return (
    <div className={blockClass}>
      <div style={{textAlign: 'center', margin: '-16px'}}>
        <BasicButton display rounder onClick={onEdit}>
          <MathSpan tex={tex} mode={'textstyle'} />
        </BasicButton>
      </div>
      {/* {React.createElement('math-field', {readonly: true, style: {width: '100%'}}, tex)} */}
      {tex && (
        <>
          <Space size={1} />
          <MiniTitle literal>LaTeX</MiniTitle>
          <Space size={-3} />
          <TextBlock src={tex} select />

          {!!ascii && (
            <>
              <Space size={0} />
              <MiniTitle literal>ASCII</MiniTitle>
              <Space size={-3} />
              <TextBlock src={ascii} select />
            </>
          )}

          {!!mathMl && (
            <>
              <Space size={0} />
              <MiniTitle literal>MathML</MiniTitle>
              <Space size={-3} />
              <TextBlock src={mathMl} select />
            </>
          )}

          {!!mathJson && (
            <>
              <Space size={0} />
              <MiniTitle literal>MathJSON</MiniTitle>
              <Space size={-3} />
              <TextBlock src={mathJson} select />
            </>
          )}

          {!!mathHTML && (
            <>
              <Space size={0} />
              <MiniTitle literal>HTML</MiniTitle>
              <Space size={-3} />
              <TextBlock
                src={
                  '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mathlive/mathlive-static.css" />\n' +
                  mathHTML
                }
                select
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
