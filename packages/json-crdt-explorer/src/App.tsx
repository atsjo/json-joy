import * as React from 'react';
import {JsonCrdtExplorer} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtExplorer';
import {Menu} from './Menu';

export const App: React.FC = () => {
  return (
    <>
      <Menu />
      <JsonCrdtExplorer />
    </>
  );
};
