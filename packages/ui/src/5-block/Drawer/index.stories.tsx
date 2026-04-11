import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Menu, type MenuItemDef} from '../../4-card/Menu';
import {Drawer, InlineDrawer, OverlayDrawer, DrawerHeader, DrawerBody, DrawerFooter, DrawerState} from '.';
import {Button} from '../../2-inline-block/Button';

const meta: Meta = {
  title: '5. Block/Drawer',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const noop = () => {};

const navItems: MenuItemDef[] = [
  {
    key: 'overview',
    menuItem: 'Overview',
    onClick: noop,
  },
  {
    key: 'getting-started',
    menuItem: 'Getting started',
    activeChild: true,
    onClick: noop,
    children: [
      {
        key: 'installation',
        menuItem: 'Installation',
        onClick: noop,
      },
      {
        key: 'responsive-layout',
        menuItem: 'Responsive layout',
        active: true,
        activeChild: true,
        onClick: noop,
      },
      {
        key: 'accessibility',
        menuItem: 'Accessibility',
        onClick: noop,
      },
    ],
  },
  {
    key: 'components',
    menuItem: 'Components',
    onClick: noop,
  },
  {
    key: 'patterns',
    menuItem: 'Patterns',
    onClick: noop,
  },
  {
    key: 'release-notes',
    menuItem: 'Release notes',
    onClick: noop,
  },
];

const NavContent = () => (
  <DrawerBody>
    <Menu items={navItems} />
  </DrawerBody>
);

export const InlineLeft: StoryObj = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <div style={{display: 'flex', height: 400, border: '1px solid #ddd'}}>
        <InlineDrawer open={open} side="left" width={200} onOpenChange={setOpen} aria-label="Navigation">
          <DrawerHeader>
            <span style={{fontSize: 13, fontWeight: 600}}>Navigation</span>
          </DrawerHeader>
          <NavContent />
        </InlineDrawer>
        <div style={{flex: 1, padding: 16}}>
          <button onClick={() => setOpen((v) => !v)}>{open ? 'Close' : 'Open'} drawer</button>
          <p>Main content area</p>
        </div>
      </div>
    );
  },
};

export const InlineRight: StoryObj = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <div style={{display: 'flex', height: 400, border: '1px solid #ddd'}}>
        <div style={{flex: 1, padding: 16}}>
          <button onClick={() => setOpen((v) => !v)}>{open ? 'Close' : 'Open'} panel</button>
          <p>Main content area</p>
        </div>
        <InlineDrawer open={open} side="right" width={240} onOpenChange={setOpen} aria-label="Detail panel">
          <DrawerHeader>
            <span style={{fontSize: 13, fontWeight: 600}}>Details</span>
          </DrawerHeader>
          <NavContent />
          <DrawerFooter>
            <Button onClick={() => setOpen(false)} style={{width: '100%'}}>
              Close
            </Button>
          </DrawerFooter>
        </InlineDrawer>
      </div>
    );
  },
};

export const OverlayLeft: StoryObj = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div style={{height: 400, position: 'relative', border: '1px solid #ddd', padding: 16}}>
        <button onClick={() => setOpen(true)}>Open overlay drawer</button>
        <OverlayDrawer
          open={open}
          onOpenChange={(next) => setOpen(next)}
          side="left"
          width={260}
          aria-label="Navigation"
        >
          <DrawerHeader>
            <span style={{fontSize: 13, fontWeight: 600}}>Navigation</span>
          </DrawerHeader>
          <NavContent />
        </OverlayDrawer>
      </div>
    );
  },
};

export const OverlayRight: StoryObj = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div style={{height: 400, position: 'relative', border: '1px solid #ddd', padding: 16}}>
        <button onClick={() => setOpen(true)}>Open right panel</button>
        <OverlayDrawer
          open={open}
          onOpenChange={(next) => setOpen(next)}
          side="right"
          width={300}
          aria-label="Settings"
        >
          <DrawerHeader>
            <span style={{fontSize: 13, fontWeight: 600}}>Settings</span>
          </DrawerHeader>
          <NavContent />
          <DrawerFooter>
            <Button onClick={() => setOpen(false)} style={{width: '100%'}}>
              Done
            </Button>
          </DrawerFooter>
        </OverlayDrawer>
      </div>
    );
  },
};

export const ExternalState: StoryObj = {
  render: () => {
    const state = React.useMemo(() => new DrawerState({open: true, side: 'left', width: 200}), []);
    return (
      <div style={{display: 'flex', height: 400, border: '1px solid #ddd'}}>
        <Drawer state={state} aria-label="Navigation">
          <DrawerHeader>
            <span style={{fontSize: 13, fontWeight: 600}}>Controlled via state</span>
          </DrawerHeader>
          <NavContent />
        </Drawer>
        <div style={{flex: 1, padding: 16}}>
          <button onClick={state.toggle}>Toggle</button>
          <button onClick={() => state.width$.next(state.width$.value + 20)} style={{marginLeft: 8}}>
            Wider
          </button>
          <button onClick={() => state.width$.next(Math.max(80, state.width$.value - 20))} style={{marginLeft: 8}}>
            Narrower
          </button>
        </div>
      </div>
    );
  },
};
