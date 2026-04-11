import * as React from 'react';
import {JsonCrdtExplorer} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtExplorer';
import {NiceUiProvider} from '@jsonjoy.com/ui/lib/context/NiceUiProvider';

export const App: React.FC = () => {
  return (
    <NiceUiProvider>
      <JsonCrdtExplorer />
    </NiceUiProvider>
  );
};
