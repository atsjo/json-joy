import {behavior as p} from './p';
import {behavior as blockquote} from './blockquote';
import {behavior as codeblock} from './codeblock';
import {behavior as mathblock} from './mathblock';
import {behavior as pre} from './pre';
import {behavior as h1} from './h1';
import {behavior as h2} from './h2';
import {behavior as h3} from './h3';
import {behavior as h4} from './h4';
import {behavior as h5} from './h5';
import {behavior as h6} from './h6';
import {behavior as title} from './title';
import {behavior as subtitle} from './subtitle';

export const blocks = [
  // Text
  p,
  codeblock,
  blockquote,
  mathblock,
  pre,

  // Headings
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  title,
  subtitle,
];
