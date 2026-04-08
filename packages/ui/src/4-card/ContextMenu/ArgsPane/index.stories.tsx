import * as React from 'react';
import {ArgsPane, type ArgsPaneProps} from './index';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const action =
  (name: string) =>
  (...args: unknown[]) =>
    console.log(name, ...args);

const meta: Meta = {
  title: '4. Card/ContextMenu/ArgsPane',
  component: ArgsPane,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Default: StoryObj<ArgsPaneProps> = {
  args: {
    item: {
      name: 'Open Link',
    },
    params: [
      {
        kind: 'str',
        id: 'note',
        name: 'Note',
        placeholder: 'Optional note…',
      },
      {
        kind: 'bool',
        id: 'poster',
        name: 'Use as poster',
        description: 'Whether to use the link as a poster',
        optional: false,
      },
      {
        kind: 'bool',
        id: 'private',
        name: 'Private',
        default: true,
      },
      {
        kind: 'num',
        id: 'size',
        name: 'Size',
        optional: true,
        placeholder: 'Size in MB',
        default: 10,
      },
      {
        kind: 'color',
        id: 'color',
        name: 'Color',
        optional: true,
        default: '#0077ff',
      },
      {
        kind: 'select',
        id: 'quality',
        name: 'Quality',
        optional: true,
        default: 'medium',
        options: [
          {name: 'low', display: () => 'Low'},
          {name: 'medium', display: () => 'Medium'},
          {name: 'high', display: () => 'High'},
        ],
      },
    ],
  },
};

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Pacific/Honolulu',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
];

const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Courier New',
  'Lucida Console',
  'Monaco',
  'Menlo',
  'Consolas',
  'SF Mono',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Code Pro',
  'Fira Code',
  'JetBrains Mono',
  'IBM Plex Sans',
  'Noto Sans',
  'Ubuntu',
  'Raleway',
  'Playfair Display',
  'Merriweather',
  'Oswald',
  'Nunito',
  'PT Sans',
];

export const Interactive: StoryObj<ArgsPaneProps> = {
  args: {
    item: {
      name: 'Create Event',
    },
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
    params: [
      {
        kind: 'str',
        id: 'title',
        name: 'Title',
        placeholder: 'Event title…',
      },
      {
        kind: 'str',
        id: 'description',
        name: 'Description',
        placeholder: 'Describe the event…',
        optional: true,
      },
      {
        kind: 'bool',
        id: 'allDay',
        name: 'All day',
        description: 'Event spans the entire day',
        default: false,
      },
      {
        kind: 'num',
        id: 'duration',
        name: 'Duration (min)',
        placeholder: 'Duration in minutes',
        default: 60,
      },
      {
        kind: 'color',
        id: 'color',
        name: 'Label Color',
        default: '#ff5722',
      },
      {
        kind: 'select',
        id: 'timezone',
        name: 'Timezone',
        default: 'UTC',
        options: timezones.map((tz) => ({name: tz, display: () => tz})),
      },
      {
        kind: 'select',
        id: 'repeat',
        name: 'Repeat',
        optional: true,
        default: 'none',
        options: [
          {name: 'none', display: () => 'None'},
          {name: 'daily', display: () => 'Daily'},
          {name: 'weekly', display: () => 'Weekly'},
          {name: 'biweekly', display: () => 'Every 2 weeks'},
          {name: 'monthly', display: () => 'Monthly'},
          {name: 'yearly', display: () => 'Yearly'},
        ],
      },
      {
        kind: 'bool',
        id: 'notify',
        name: 'Send notifications',
        default: true,
      },
    ],
  },
};

export const LongSelectList: StoryObj<ArgsPaneProps> = {
  args: {
    item: {
      name: 'Typography Settings',
    },
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
    params: [
      {
        kind: 'select',
        id: 'fontFamily',
        name: 'Font Family',
        default: 'Inter',
        options: fontFamilies.map((f) => ({name: f, display: () => f})),
      },
      {
        kind: 'num',
        id: 'fontSize',
        name: 'Font Size (px)',
        placeholder: 'e.g. 16',
        default: 16,
      },
      {
        kind: 'num',
        id: 'lineHeight',
        name: 'Line Height',
        placeholder: 'e.g. 1.5',
        default: 1.5,
        optional: true,
      },
      {
        kind: 'num',
        id: 'letterSpacing',
        name: 'Letter Spacing (px)',
        placeholder: 'e.g. 0',
        default: 0,
        optional: true,
      },
      {
        kind: 'color',
        id: 'textColor',
        name: 'Text Color',
        default: '#1a1a1a',
      },
      {
        kind: 'color',
        id: 'bgColor',
        name: 'Background Color',
        default: '#ffffff',
        optional: true,
      },
      {
        kind: 'bool',
        id: 'bold',
        name: 'Bold',
      },
      {
        kind: 'bool',
        id: 'italic',
        name: 'Italic',
      },
      {
        kind: 'select',
        id: 'textAlign',
        name: 'Text Align',
        default: 'left',
        options: [
          {name: 'left', display: () => 'Left'},
          {name: 'center', display: () => 'Center'},
          {name: 'right', display: () => 'Right'},
          {name: 'justify', display: () => 'Justify'},
        ],
      },
    ],
  },
};

export const MinimalBoolOnly: StoryObj<ArgsPaneProps> = {
  args: {
    item: {
      name: 'Preferences',
    },
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
    params: [
      {
        kind: 'bool',
        id: 'darkMode',
        name: 'Dark mode',
        default: false,
      },
      {
        kind: 'bool',
        id: 'animations',
        name: 'Enable animations',
        default: true,
      },
      {
        kind: 'bool',
        id: 'sounds',
        name: 'Sound effects',
        description: 'Play sounds on interactions',
      },
      {
        kind: 'bool',
        id: 'autoSave',
        name: 'Auto-save',
        default: true,
        description: 'Automatically save changes',
      },
    ],
  },
};

export const AllOptional: StoryObj<ArgsPaneProps> = {
  args: {
    item: {
      name: 'Export Options',
    },
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
    params: [
      {
        kind: 'str',
        id: 'filename',
        name: 'Filename',
        placeholder: 'custom-export-name',
        optional: true,
      },
      {
        kind: 'select',
        id: 'format',
        name: 'Format',
        optional: true,
        default: 'json',
        options: [
          {name: 'json', display: () => 'JSON'},
          {name: 'csv', display: () => 'CSV'},
          {name: 'xml', display: () => 'XML'},
          {name: 'yaml', display: () => 'YAML'},
          {name: 'toml', display: () => 'TOML'},
          {name: 'msgpack', display: () => 'MessagePack'},
          {name: 'protobuf', display: () => 'Protocol Buffers'},
          {name: 'avro', display: () => 'Avro'},
          {name: 'parquet', display: () => 'Parquet'},
        ],
      },
      {
        kind: 'num',
        id: 'maxRows',
        name: 'Max Rows',
        placeholder: 'Unlimited if empty',
        optional: true,
      },
      {
        kind: 'bool',
        id: 'includeHeaders',
        name: 'Include headers',
        optional: true,
        default: true,
      },
      {
        kind: 'bool',
        id: 'compress',
        name: 'Compress output',
        optional: true,
        description: 'Gzip the exported file',
      },
      {
        kind: 'color',
        id: 'highlightColor',
        name: 'Highlight Color',
        optional: true,
      },
    ],
  },
};
