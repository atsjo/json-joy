import * as React from 'react';
import {SliceStacking, SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {SpanBehavior} from '../../SpanBehavior';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import type {IconProps, ValidationResult} from '../../SpanBehavior';
import type {Fmt} from '../../../state/formattings';

export const Icon = makeIcon({set: 'lucide', icon: 'link'});

const NAME = 'Highlight';

export const behavior = new (class MarkBehavior extends SpanBehavior<SliceStacking.One, SliceTypeCon.mark> {
  constructor() {
    super(SliceStacking.One, SliceTypeCon.mark, NAME);
  }

  public readonly menu = {
    name: NAME,
    icon: () => <Icon width={15} height={15} />,
    right: () => <Sidetip small>⌘ K</Sidetip>,
    keys: ['⌘', 'k'],
  };

  public readonly render = (children: React.ReactNode) => <mark>{children}</mark>;
})();
