import {SbsCollabMonacoDemo} from '.';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof SbsCollabMonacoDemo> = {
  component: SbsCollabMonacoDemo,
  title: '<SideBySideSync>/<SbsCollabMonacoDemo>',
};

export default meta;

export const MonacoEditor: StoryObj<typeof meta> = {};
