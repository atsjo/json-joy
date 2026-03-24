import * as React from 'react';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {PeritextEditor} from '..';
import {DebugPlugin} from '../../plugins/debug';
import type {PeritextApi} from 'json-joy/lib/json-crdt-extensions/peritext';

const plugins0 = [new DebugPlugin()];

export default {
  component: PeritextEditor,
  title: 'editor/<PeritextEditor>',
};

const markdown = require('./docs/long.md') as string;

const Demo: React.FC = (props) => {
  const [[model, node]] = React.useState(() => {
    const model = ModelWithExt.create(ext.peritext.new(''));
    const node = model.s.toExt();
    return [model, node as unknown as PeritextApi] as const;
  });

  React.useEffect(() => {
    model.api.autoFlush(true);
    return () => {
      model.api.stopAutoFlush?.();
    };
  }, [model]);

  return (
    <PeritextEditor
      node={node}
      plugins0={plugins0}
      onStart={(state) => {
        state.events.et.buffer({
          action: 'paste',
          format: 'md',
          at: [0],
          data: {
            text: markdown,
          },
        });
        state.peritext.refresh();
      }}
    />
  );
};

export const Default = {
  render: () => <Demo />,
};
