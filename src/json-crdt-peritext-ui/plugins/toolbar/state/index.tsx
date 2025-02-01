// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {Sidetip} from 'nice-ui/lib/1-inline/Sidetip';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {ValueSyncStore} from '../../../../util/events/sync-store';
import {annotations, secondBrain} from './menus';
import {Code} from 'nice-ui/lib/1-inline/Code';
import {FontStyleButton} from 'nice-ui/lib/2-inline-block/FontStyleButton';
import type {UiLifeCyclesRender} from '../../../dom/types';
import type {PeritextEventDetailMap} from '../../../events/types';
import type {PeritextSurfaceState} from '../../../react';
import type {MenuItem} from '../types';
import {CommonSliceType} from '../../../../json-crdt-extensions';

export class ToolbarState implements UiLifeCyclesRender {
  public lastEvent: PeritextEventDetailMap['change']['ev'] | undefined = void 0;
  public lastEventTs: number = 0;
  public readonly showInlineToolbar = new ValueSyncStore<[show: boolean, time: number]>([false, 0]);

  constructor(public readonly surface: PeritextSurfaceState) {}

  /** ------------------------------------------- {@link UiLifeCyclesRender} */

  public start() {
    const {surface, showInlineToolbar} = this;
    const {dom, events} = surface;
    const {et} = events;
    const mouseDown = dom!.cursor.mouseDown;
    const source = dom!.opts.source;

    const changeUnsubscribe = et.subscribe('change', (ev) => {
      const lastEvent = ev.detail.ev;
      this.setLastEv(lastEvent);
      // const lastEventIsCaretPositionChange =
      //   lastEvent?.type === 'cursor' &&
      //   typeof (lastEvent?.detail as PeritextEventDetailMap['cursor']).at === 'number';
      // this.showInlineToolbar.next(this.doShowInlineToolbar());
    });

    const unsubscribeMouseDown = mouseDown?.subscribe(() => {
      // if (mouseDown.value) showInlineToolbar.next(false);
    });
    
    const mouseDownListener = (event: MouseEvent) => {
      // showInlineToolbar.next(false); 
      // if (showInlineToolbar.value[0])
      //   showInlineToolbar.next([false, Date.now()]); 
    };
    const mouseUpListener = (event: MouseEvent) => {
      if (!showInlineToolbar.value[0])
        showInlineToolbar.next([true, Date.now()]); 
    };

    source?.addEventListener('mousedown', mouseDownListener);
    source?.addEventListener('mouseup', mouseUpListener);
    
    return () => {
      changeUnsubscribe();
      unsubscribeMouseDown?.();
      source?.removeEventListener('mousedown', mouseDownListener);
      source?.removeEventListener('mouseup', mouseUpListener);
    };
  }

  private setLastEv(lastEvent: PeritextEventDetailMap['change']['ev']) {
    this.lastEvent = lastEvent;
    this.lastEventTs = Date.now();
  }

  private doShowInlineToolbar(): boolean {
    const {surface, lastEvent} = this;
    if (surface.dom!.cursor.mouseDown.value) return false;
    if (!lastEvent) return false;
    const lastEventIsCursorEvent = lastEvent?.type === 'cursor';
    if (!lastEventIsCursorEvent) return false;
    if (!surface.peritext.editor.cursorCount()) return false;
    return true;
  }

  // -------------------------------------------------------------------- Menus

  public readonly getFormattingMenu = (): MenuItem => {
    const et = this.surface.events.et;
    return (
          {
            name: 'Formatting',
            expandChild: 0,
            children: [
              {
                name: 'Common',
                expand: 8,
                children: [
                  {
                    name: 'Bold',
                    icon: () => <Iconista width={15} height={15} set="radix" icon="font-bold" />,
                    // icon: () => <Iconista width={16} height={16} set="lucide" icon="bold" />,
                    right: () => <Sidetip small>⌘ B</Sidetip>,
                    keys: ['⌘', 'b'],
                    onSelect: () => {
                      et.format(CommonSliceType.b);
                    },
                  },
                  {
                    name: 'Italic',
                    // icon: () => <Iconista width={15} height={15} set="radix" icon="font-italic" />,
                    // icon: () => <Iconista width={16} height={16} set="lucide" icon="italic" />,
                    icon: () => <Iconista width={14} height={14} set="lucide" icon="italic" />,
                    right: () => <Sidetip small>⌘ I</Sidetip>,
                    keys: ['⌘', 'i'],
                    onSelect: () => {
                      et.format(CommonSliceType.i);
                    },
                  },
                  {
                    name: 'Underline',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="underline" />,
                    right: () => <Sidetip small>⌘ U</Sidetip>,
                    keys: ['⌘', 'u'],
                    onSelect: () => {
                      et.format(CommonSliceType.u);
                    },
                  },
                  {
                    name: 'Strikethrough',
                    // icon: () => <Iconista width={15} height={15} set="radix" icon="strikethrough" />,
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="strikethrough" />,
                    onSelect: () => {
                      et.format(CommonSliceType.s);
                    },
                  },
                  {
                    name: 'Overline',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="overline" />,
                    onSelect: () => {
                      et.format(CommonSliceType.overline);
                    },
                  },
                  {
                    name: 'Highlight',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="highlight" />,
                    onSelect: () => {
                      et.format(CommonSliceType.mark);
                    },
                  },
                  {
                    name: 'Classified',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="lock-password" />,
                    onSelect: () => {
                      et.format(CommonSliceType.hidden);
                    },
                  },
                ],
              },
              {
                name: 'Technical separator',
                sep: true,
              },
              {
                name: 'Technical',
                expand: 8,
                children: [
                  {
                    name: 'Code',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="code" />,
                    onSelect: () => {},
                  },
                  {
                    name: 'Math',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="math-integral-x" />,
                    onSelect: () => {},
                  },
                  {
                    name: 'Superscript',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="superscript" />,
                    onSelect: () => {},
                  },
                  {
                    name: 'Subscript',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="subscript" />,
                    onSelect: () => {},
                  },
                  {
                    name: 'Keyboard key',
                    icon: () => <Iconista width={16} height={16} set="lucide" icon="keyboard" />,
                    onSelect: () => {},
                  },
                  {
                    name: 'Insertion',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="pencil-plus" />,
                    onSelect: () => {},
                  },
                  {
                    name: 'Deletion',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="pencil-minus" />,
                    onSelect: () => {},
                  },
                ],
              },
              {
                name: 'Artistic separator',
                sep: true,
              },
              {
                name: 'Artistic',
                expand: 8,
                children: [
                  {
                    name: 'Color',
                    icon: () => <Iconista width={16} height={16} set="lucide" icon="paintbrush" />,
                    onSelect: () => {},
                  },
                  {
                    name: 'Background',
                    icon: () => <Iconista width={16} height={16} set="lucide" icon="paint-bucket" />,
                    onSelect: () => {},
                  },
                  {
                    name: 'Border',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="border-left" />,
                    onSelect: () => {},
                  },
                ],
              },
            ],
          }
    );
  };

  public readonly getCaretMenu = (): MenuItem => {
    return {
      name: 'Inline text',
      maxToolbarItems: 4,
      children: [
        this.getFormattingMenu(),
        secondBrain(),
        {
          name: 'Annotations separator',
          sep: true,
        },
        annotations(),
        {
          name: 'Style separator',
          sep: true,
        },
        {
          name: 'Typesetting',
          expand: 4,
          openOnTitleHov: true,
          icon: () => <Iconista width={16} height={16} set="tabler" icon="typography" />,
          onSelect: () => {},
          children: [
            {
              name: 'Sans-serif',
              iconBig: () => <FontStyleButton kind={'sans'} />,
              onSelect: () => {},
            },
            {
              name: 'Serif',
              iconBig: () => <FontStyleButton kind={'serif'} />,
              onSelect: () => {},
            },
            {
              name: 'Slab',
              icon: () => <FontStyleButton kind={'slab'} size={16} />,
              iconBig: () => <FontStyleButton kind={'slab'} />,
              onSelect: () => {},
            },
            {
              name: 'Monospace',
              iconBig: () => <FontStyleButton kind={'mono'} />,
              onSelect: () => {},
            },
            // {
            //   name: 'Custom typeface separator',
            //   sep: true,
            // },
            {
              name: 'Custom typeface',
              expand: 10,
              icon: () => <Iconista width={15} height={15} set="radix" icon="font-style" />,
              children: [
                {
                  name: 'Typeface',
                  // icon: () => <Iconista width={15} height={15} set="radix" icon="font-style" />,
                  icon: () => <Iconista width={15} height={15} set="radix" icon="font-family" />,
                  onSelect: () => {},
                },
                {
                  name: 'Text size',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="font-size" />,
                  onSelect: () => {},
                },
                {
                  name: 'Letter spacing',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-spacing" />,
                  onSelect: () => {},
                },
                {
                  name: 'Word spacing',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-spacing" />,
                  onSelect: () => {},
                },
                {
                  name: 'Caps separator',
                  sep: true,
                },
                {
                  name: 'Large caps',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-case-uppercase" />,
                  onSelect: () => {},
                },
                {
                  name: 'Small caps',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-case-lowercase" />,
                  onSelect: () => {},
                },
              ],
            },
          ],
        },
        {
          name: 'Modify separator',
          sep: true,
        },
        {
          name: 'Modify',
          expand: 3,
          onSelect: () => {},
          children: [
            {
              name: 'Pick layer',
              right: () => (
                <Code size={-1} gray>
                  9+
                </Code>
              ),
              more: true,
              icon: () => <Iconista width={15} height={15} set="radix" icon="layers" />,
              onSelect: () => {},
            },
            {
              name: 'Erase formatting',
              danger: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="eraser" />,
              onSelect: () => {},
            },
            {
              name: 'Delete all in range',
              danger: true,
              more: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="trash" />,
              onSelect: () => {},
            },
          ],
        },
        {
          name: 'Clipboard separator',
          sep: true,
        },
        {
          name: 'Copy, cut, and paste',
          // icon: () => <Iconista width={15} height={15} set="radix" icon="copy" />,
          icon: () => <Iconista width={16} height={16} set="lucide" icon="copy" />,
          expand: 0,
          children: [
            {
              id: 'copy-menu',
              name: 'Copy',
              // icon: () => <Iconista width={15} height={15} set="radix" icon="copy" />,
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
              expand: 5,
              children: [
                {
                  name: 'Copy',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  onSelect: () => {},
                },
                {
                  name: 'Copy text only',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  onSelect: () => {},
                },
                {
                  name: 'Copy as Markdown',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  right: () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />,
                  onSelect: () => {},
                },
                {
                  name: 'Copy as HTML',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  right: () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />,
                  onSelect: () => {},
                },
              ],
            },
            {
              name: 'Cut separator',
              sep: true,
            },
            {
              id: 'cut-menu',
              name: 'Cut',
              // icon: () => <Iconista width={15} height={15} set="radix" icon="copy" />,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
              expand: 5,
              children: [
                {
                  name: 'Cut',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  onSelect: () => {},
                },
                {
                  name: 'Cut text only',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  onSelect: () => {},
                },
                {
                  name: 'Cut as Markdown',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  right: () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />,
                  onSelect: () => {},
                },
                {
                  name: 'Cut as HTML',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  right: () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />,
                  onSelect: () => {},
                },
              ],
            },
            {
              name: 'Paste separator',
              sep: true,
            },
            {
              id: 'paste-menu',
              name: 'Paste',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
              expand: 5,
              children: [
                {
                  name: 'Paste',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
                  onSelect: () => {},
                },
                {
                  name: 'Paste text only',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
                  onSelect: () => {},
                },
                {
                  name: 'Paste formatting',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
                  onSelect: () => {},
                },
              ],
            },
          ],
        },
        {
          name: 'Insert',
          icon: () => <Iconista width={16} height={16} set="lucide" icon="between-vertical-end" />,
          children: [
            {
              name: 'Smart chip',
              icon: () => <Iconista width={15} height={15} set="radix" icon="button" />,
              children: [
                {
                  name: 'Date',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="calendar" />,
                  onSelect: () => {},
                },
                {
                  name: 'AI chip',
                  icon: () => <Iconista style={{color: 'purple'}} width={16} height={16} set="tabler" icon="brain" />,
                  onSelect: () => {},
                },
                {
                  name: 'Solana wallet',
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="wallet" />,
                  onSelect: () => {},
                },
                {
                  name: 'Dropdown',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                  children: [
                    {
                      name: 'Create new',
                      icon: () => <Iconista width={15} height={15} set="radix" icon="plus" />,
                      onSelect: () => {},
                    },
                    {
                      name: 'Document dropdowns separator',
                      sep: true,
                    },
                    {
                      name: 'Document dropdowns',
                      expand: 8,
                      onSelect: () => {},
                      children: [
                        {
                          name: 'Configuration 1',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onSelect: () => {},
                        },
                        {
                          name: 'Configuration 2',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onSelect: () => {},
                        },
                      ],
                    },
                    {
                      name: 'Presets dropdowns separator',
                      sep: true,
                    },
                    {
                      name: 'Presets dropdowns',
                      expand: 8,
                      onSelect: () => {},
                      children: [
                        {
                          name: 'Project status',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onSelect: () => {},
                        },
                        {
                          name: 'Review status',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onSelect: () => {},
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'Link',
              // icon: () => <Iconista width={15} height={15} set="lucide" icon="link" />,
              icon: () => <Iconista width={15} height={15} set="radix" icon="link-2" />,
              onSelect: () => {},
            },
            {
              name: 'Reference',
              icon: () => <Iconista width={15} height={15} set="radix" icon="sewing-pin" />,
              onSelect: () => {},
            },
            {
              name: 'File',
              icon: () => <Iconista width={15} height={15} set="radix" icon="file" />,
              onSelect: () => {},
            },
            {
              name: 'Template',
              text: 'building blocks',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="template" />,
              children: [
                {
                  name: 'Meeting notes',
                  onSelect: () => {},
                },
                {
                  name: 'Email draft (created by AI)',
                  onSelect: () => {},
                },
                {
                  name: 'Product roadmap',
                  onSelect: () => {},
                },
                {
                  name: 'Review tracker',
                  onSelect: () => {},
                },
                {
                  name: 'Project assets',
                  onSelect: () => {},
                },
                {
                  name: 'Content launch tracker',
                  onSelect: () => {},
                },
              ],
            },
            {
              name: 'On-screen keyboard',
              icon: () => <Iconista width={15} height={15} set="radix" icon="keyboard" />,
              onSelect: () => {},
            },
            {
              name: 'Emoji',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="smile-plus" />,
              onSelect: () => {},
            },
            {
              name: 'Special characters',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="omega" />,
              onSelect: () => {},
            },
            {
              name: 'Variable',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="variable" />,
              onSelect: () => {},
            },
          ],
        },
        {
          name: 'Developer tools',
          danger: true,
          icon: () => <Iconista width={16} height={16} set="lucide" icon="square-chevron-right" />,
          onSelect: () => {},
        },
      ],
    };
  };

  public readonly getSelectionMenu = (): MenuItem => {
    return {
      name: 'Inline text',
      maxToolbarItems: 4,
      children: [
        this.getFormattingMenu(),
        /*
        secondBrain(),
        {
          name: 'Annotations separator',
          sep: true,
        },
        annotations(),
        {
          name: 'Style separator',
          sep: true,
        },
        {
          name: 'Typesetting',
          expand: 4,
          openOnTitleHov: true,
          icon: () => <Iconista width={16} height={16} set="tabler" icon="typography" />,
          onSelect: () => {},
          children: [
            {
              name: 'Sans-serif',
              iconBig: () => <FontStyleButton kind={'sans'} />,
              onSelect: () => {},
            },
            {
              name: 'Serif',
              iconBig: () => <FontStyleButton kind={'serif'} />,
              onSelect: () => {},
            },
            {
              name: 'Slab',
              icon: () => <FontStyleButton kind={'slab'} size={16} />,
              iconBig: () => <FontStyleButton kind={'slab'} />,
              onSelect: () => {},
            },
            {
              name: 'Monospace',
              iconBig: () => <FontStyleButton kind={'mono'} />,
              onSelect: () => {},
            },
            // {
            //   name: 'Custom typeface separator',
            //   sep: true,
            // },
            {
              name: 'Custom typeface',
              expand: 10,
              icon: () => <Iconista width={15} height={15} set="radix" icon="font-style" />,
              children: [
                {
                  name: 'Typeface',
                  // icon: () => <Iconista width={15} height={15} set="radix" icon="font-style" />,
                  icon: () => <Iconista width={15} height={15} set="radix" icon="font-family" />,
                  onSelect: () => {},
                },
                {
                  name: 'Text size',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="font-size" />,
                  onSelect: () => {},
                },
                {
                  name: 'Letter spacing',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-spacing" />,
                  onSelect: () => {},
                },
                {
                  name: 'Word spacing',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-spacing" />,
                  onSelect: () => {},
                },
                {
                  name: 'Caps separator',
                  sep: true,
                },
                {
                  name: 'Large caps',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-case-uppercase" />,
                  onSelect: () => {},
                },
                {
                  name: 'Small caps',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-case-lowercase" />,
                  onSelect: () => {},
                },
              ],
            },
          ],
        },
        {
          name: 'Modify separator',
          sep: true,
        },
        {
          name: 'Modify',
          expand: 3,
          onSelect: () => {},
          children: [
            {
              name: 'Pick layer',
              right: () => (
                <Code size={-1} gray>
                  9+
                </Code>
              ),
              more: true,
              icon: () => <Iconista width={15} height={15} set="radix" icon="layers" />,
              onSelect: () => {},
            },
            {
              name: 'Erase formatting',
              danger: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="eraser" />,
              onSelect: () => {},
            },
            {
              name: 'Delete all in range',
              danger: true,
              more: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="trash" />,
              onSelect: () => {},
            },
          ],
        },
        {
          name: 'Clipboard separator',
          sep: true,
        },
        {
          name: 'Copy, cut, and paste',
          // icon: () => <Iconista width={15} height={15} set="radix" icon="copy" />,
          icon: () => <Iconista width={16} height={16} set="lucide" icon="copy" />,
          expand: 0,
          children: [
            {
              id: 'copy-menu',
              name: 'Copy',
              // icon: () => <Iconista width={15} height={15} set="radix" icon="copy" />,
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
              expand: 5,
              children: [
                {
                  name: 'Copy',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  onSelect: () => {},
                },
                {
                  name: 'Copy text only',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  onSelect: () => {},
                },
                {
                  name: 'Copy as Markdown',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  right: () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />,
                  onSelect: () => {},
                },
                {
                  name: 'Copy as HTML',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  right: () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />,
                  onSelect: () => {},
                },
              ],
            },
            {
              name: 'Cut separator',
              sep: true,
            },
            {
              id: 'cut-menu',
              name: 'Cut',
              // icon: () => <Iconista width={15} height={15} set="radix" icon="copy" />,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
              expand: 5,
              children: [
                {
                  name: 'Cut',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  onSelect: () => {},
                },
                {
                  name: 'Cut text only',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  onSelect: () => {},
                },
                {
                  name: 'Cut as Markdown',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  right: () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />,
                  onSelect: () => {},
                },
                {
                  name: 'Cut as HTML',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  right: () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />,
                  onSelect: () => {},
                },
              ],
            },
            {
              name: 'Paste separator',
              sep: true,
            },
            {
              id: 'paste-menu',
              name: 'Paste',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
              expand: 5,
              children: [
                {
                  name: 'Paste',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
                  onSelect: () => {},
                },
                {
                  name: 'Paste text only',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
                  onSelect: () => {},
                },
                {
                  name: 'Paste formatting',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
                  onSelect: () => {},
                },
              ],
            },
          ],
        },
        {
          name: 'Insert',
          icon: () => <Iconista width={16} height={16} set="lucide" icon="between-vertical-end" />,
          children: [
            {
              name: 'Smart chip',
              icon: () => <Iconista width={15} height={15} set="radix" icon="button" />,
              children: [
                {
                  name: 'Date',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="calendar" />,
                  onSelect: () => {},
                },
                {
                  name: 'AI chip',
                  icon: () => <Iconista style={{color: 'purple'}} width={16} height={16} set="tabler" icon="brain" />,
                  onSelect: () => {},
                },
                {
                  name: 'Solana wallet',
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="wallet" />,
                  onSelect: () => {},
                },
                {
                  name: 'Dropdown',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                  children: [
                    {
                      name: 'Create new',
                      icon: () => <Iconista width={15} height={15} set="radix" icon="plus" />,
                      onSelect: () => {},
                    },
                    {
                      name: 'Document dropdowns separator',
                      sep: true,
                    },
                    {
                      name: 'Document dropdowns',
                      expand: 8,
                      onSelect: () => {},
                      children: [
                        {
                          name: 'Configuration 1',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onSelect: () => {},
                        },
                        {
                          name: 'Configuration 2',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onSelect: () => {},
                        },
                      ],
                    },
                    {
                      name: 'Presets dropdowns separator',
                      sep: true,
                    },
                    {
                      name: 'Presets dropdowns',
                      expand: 8,
                      onSelect: () => {},
                      children: [
                        {
                          name: 'Project status',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onSelect: () => {},
                        },
                        {
                          name: 'Review status',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onSelect: () => {},
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'Link',
              // icon: () => <Iconista width={15} height={15} set="lucide" icon="link" />,
              icon: () => <Iconista width={15} height={15} set="radix" icon="link-2" />,
              onSelect: () => {},
            },
            {
              name: 'Reference',
              icon: () => <Iconista width={15} height={15} set="radix" icon="sewing-pin" />,
              onSelect: () => {},
            },
            {
              name: 'File',
              icon: () => <Iconista width={15} height={15} set="radix" icon="file" />,
              onSelect: () => {},
            },
            {
              name: 'Template',
              text: 'building blocks',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="template" />,
              children: [
                {
                  name: 'Meeting notes',
                  onSelect: () => {},
                },
                {
                  name: 'Email draft (created by AI)',
                  onSelect: () => {},
                },
                {
                  name: 'Product roadmap',
                  onSelect: () => {},
                },
                {
                  name: 'Review tracker',
                  onSelect: () => {},
                },
                {
                  name: 'Project assets',
                  onSelect: () => {},
                },
                {
                  name: 'Content launch tracker',
                  onSelect: () => {},
                },
              ],
            },
            {
              name: 'On-screen keyboard',
              icon: () => <Iconista width={15} height={15} set="radix" icon="keyboard" />,
              onSelect: () => {},
            },
            {
              name: 'Emoji',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="smile-plus" />,
              onSelect: () => {},
            },
            {
              name: 'Special characters',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="omega" />,
              onSelect: () => {},
            },
            {
              name: 'Variable',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="variable" />,
              onSelect: () => {},
            },
          ],
        },
        {
          name: 'Developer tools',
          danger: true,
          icon: () => <Iconista width={16} height={16} set="lucide" icon="square-chevron-right" />,
          onSelect: () => {},
        },
        */
      ],
    };
  };
}
