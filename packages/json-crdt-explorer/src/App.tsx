import * as React from 'react';
import {JsonCrdtExplorer} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtExplorer';
import {NiceUiSizes} from '@jsonjoy.com/ui/lib/constants';
import {Menu} from './Menu';

export const App: React.FC = () => {
  return (
    <>
      <Menu />
      <div style={{width: 'calc(100vw - 64px)', maxWidth: 1300, margin: '0 auto', padding: '16px 0'}}>
        <JsonCrdtExplorer top={NiceUiSizes.TopNavHeight + 32} />
      </div>
    </>
  );
};
