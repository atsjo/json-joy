import * as React from 'react';
import {theme, rule} from 'nano-theme';
import {Split} from '../Split';
import {MiniTitle} from '../MiniTitle';
import {useT} from 'use-t';

const blockClass = rule({
  pd: 0,
  mr: 0,
  '&+&': {
    pd: '16px 0 0',
  },
});

const titleClass = rule({
  ...theme.font.ui2.bold,
  fz: '14px',
  w: '100%',
  pd: '4px 0 10px',
  mr: 0,
});

const descriptionClass = rule({
  ...theme.font.ui2.mid,
  fz: '12px',
  op: 0.75,
  w: '100%',
  pd: '8px 0 0',
  mr: 0,
});

export interface FormRowProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  optional?: boolean;
  right?: boolean;
  children: React.ReactNode;
}

export const FormRow: React.FC<FormRowProps> = ({title, description, optional, right, children}) => {
  const [t] = useT();

  let titleElement: React.ReactNode = title;
  let descriptionElement: React.ReactNode = !!description && <div className={descriptionClass} style={{padding: right ? '0 8px 0 0' : void 0}}>{description}</div>;

  if (optional) {
    titleElement = (
      <Split>
        {title}
        <MiniTitle>{t('optional')}</MiniTitle>
      </Split>
    );
  }

  return (
    <div className={blockClass}>
      {!!title && <div className={titleClass}>{titleElement}</div>}
      {right ? (
        <>
          <Split>
            {descriptionElement || <div />}
            {children}
          </Split>
        </>
      ) : (
        <>
          {children}
          {descriptionElement}
        </>
      )}
    </div>
  );
};
