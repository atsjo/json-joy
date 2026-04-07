import type {ResolveType} from '@jsonjoy.com/json-type';
import {t} from '../system';

export const PresenceEntry = t.Object(
  t.Key('id', t.str),
  t.Key('lastSeen', t.num),
  t.Key('validUntil', t.num),
  t.Key(
    'data',
    t.obj.options({
      encodeUnknownKeys: true,
    }),
  ),
);

export type TPresenceEntry = ResolveType<typeof PresenceEntry>;
