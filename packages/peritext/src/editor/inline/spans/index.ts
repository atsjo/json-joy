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
