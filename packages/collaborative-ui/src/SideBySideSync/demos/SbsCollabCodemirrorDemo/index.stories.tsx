import {SbsCollabCodemirrorDemo} from '.';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof SbsCollabCodemirrorDemo> = {
  component: SbsCollabCodemirrorDemo,
  title: '<SideBySideSync>/<SbsCollabCodemirrorDemo>',
};

export default meta;

export const Editor: StoryObj<typeof meta> = {};
