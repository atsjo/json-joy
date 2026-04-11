import * as React from 'react';
import {JsonCrdtExplorer} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtExplorer';
import {UiProvider} from '@jsonjoy.com/ui';
import {TopNav} from '@jsonjoy.com/ui/lib/5-block/TopNav';

const linkStyle: React.CSSProperties = {
  color: 'inherit',
  textDecoration: 'none',
  opacity: 0.7,
  fontSize: '13px',
  fontWeight: 500,
  padding: '4px 8px',
  borderRadius: '4px',
  transition: 'opacity 0.15s',
};

export const App: React.FC = () => {
  return (
    <UiProvider>
      <TopNav>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <a href="https://jsonjoy.com" style={{...linkStyle, opacity: 1, fontWeight: 700, fontSize: '15px'}}>
            json-joy
          </a>
          <span style={{opacity: 0.3, fontSize: '13px', userSelect: 'none'}}>·</span>
          <span style={{fontSize: '13px', opacity: 0.55}}>JSON CRDT Playground</span>
          <span style={{opacity: 0.3, fontSize: '13px', userSelect: 'none'}}>·</span>
          <span style={{fontSize: '12px', opacity: 0.45, maxWidth: '340px', lineHeight: 1.35}}>
            Load and explore JSON CRDT documents
          </span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
          <a
            href="https://jsonjoy.com/specs/json-crdt"
            target="_blank"
            rel="noreferrer"
            style={linkStyle}
          >
            Spec
          </a>
          <a
            href="https://github.com/streamich/json-joy"
            target="_blank"
            rel="noreferrer"
            style={linkStyle}
          >
            GitHub
          </a>
        </div>
      </TopNav>
      <JsonCrdtExplorer />
    </UiProvider>
  );
};
