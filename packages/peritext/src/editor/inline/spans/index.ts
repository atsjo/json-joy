import {behavior as b} from './b';
import {behavior as i} from './i';
import {behavior as u} from './u';
import {behavior as overline} from './overline';
import {behavior as s} from './s';
import {behavior as math} from './math';
import {behavior as a} from './a';
import {behavior as mark} from './mark';
import {behavior as sup} from './sup';
import {behavior as sub} from './sub';
import {behavior as ins} from './ins';
import {behavior as del} from './del';
import {behavior as col} from './col';
import {behavior as bg} from './bg';
import {behavior as code} from './code';
import {behavior as kbd} from './kbd';
import {behavior as spoiler} from './spoiler';

export const spans = [
  // Atomic
  math,

  // Many
  a,

  // One
  b,
  i,
  u,
  overline,
  s,
  mark,
  sup,
  sub,
  ins,
  del,
  col,
  bg,
  code,
  kbd,
  spoiler,
];
