import * as React from 'react';
import {theme, rule} from 'nano-theme';
import {Split} from '../Split';
import {MiniTitle} from '../MiniTitle';
import {useT} from 'use-t';

const blockClass = rule({
  pad: 0,
  mar: 0,
  '&+&': {
    pad: '16px 0 0',
  },
});

const titleClass = rule({
  ...theme.font.ui2.bold,
  fz: '14px',
  w: '100%',
  pad: '4px 0 10px',
  mar: 0,
});

const descriptionClass = rule({
  ...theme.font.ui2.mid,
  fz: '12px',
  op: 0.75,
  w: '100%',
  pad: '8px 0 0',
  mar: 0,
});

export interface FormRowProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  optional?: boolean;
  children: React.ReactNode;
}

export const FormRow: React.FC<FormRowProps> = ({title, description, optional, children}) => {
  const [t] = useT();

  let titleElement: React.ReactNode = title;

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
      {children}
      {!!description && <div className={descriptionClass}>{description}</div>}
    </div>
  );
};
