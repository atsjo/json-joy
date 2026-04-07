import {util} from './util';
import {pubsub} from './pubsub';
import {presence} from './presence';
import {block} from './block';
import type {RouteDeps} from './types';
import type {ObjValue} from '@jsonjoy.com/json-type/lib/value/ObjValue';
import type {ObjType} from '@jsonjoy.com/json-type';

// biome-ignore format: each on its own line
export const routes = (d: RouteDeps) => <R extends ObjType<any>>(r: ObjValue<R>) =>
  ( util(d)
  ( pubsub(d)
  ( presence(d)
  // TODO: rename "blocks" to "block", in all methods.
  ( block(d)
  ( r )))));
