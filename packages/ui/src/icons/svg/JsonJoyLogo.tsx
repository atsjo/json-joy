import {rule} from 'nano-theme';
import * as React from 'react';

const brand = ['#E44A28', '#985DF7', '#EE69B1', '#F6A832', '#5FCC8A', '#58B9F8'];

const grey1 = '#bababa';
const grey2 = '#d9d9d9';

const shape1Class = rule({
  fill: grey2,
  'a:hover &, svg:hover &': {
    fill: brand[0],
  },
});

const shape2Class = rule({
  fill: grey1,
  'a:hover &, svg:hover &': {
    fill: brand[1],
  },
});

const shape3Class = rule({
  fill: grey1,
  'a:hover &, svg:hover &': {
    fill: brand[2],
  },
});

const shape4Class = rule({
  fill: grey2,
  'a:hover &, svg:hover &': {
    fill: brand[3],
  },
});

const shape5Class = rule({
  fill: grey1,
  'a:hover &, svg:hover &': {
    fill: brand[4],
  },
});

const shape6Class = rule({
  fill: grey1,
  'a:hover &, svg:hover &': {
    fill: brand[5],
  },
});

export interface Props {
  size?: number;
}

const SvgFF: React.FC<Props> = ({size = 36}) => {
  return (
    <svg width={size} viewBox="0 0 92 57" fill="none">
      <path className={shape1Class} d="M0 34H23V57C10.2975 57 0 46.7025 0 34Z" />
      <path className={shape2Class} d="M46 31.5H23V57C35.7025 57 46 46.7025 46 34V31.5Z" />
      <rect className={shape3Class} x="23" width="23" height="34" />
      <path className={shape4Class} d="M46 34H69V57C56.2975 57 46 46.7025 46 34Z" />
      <path className={shape5Class} d="M92 31H69V57C81.7025 57 92 46.7025 92 34V31Z" />
      <rect className={shape6Class} x="69" width="23" height="34" />
    </svg>
  );
};

export default SvgFF;
