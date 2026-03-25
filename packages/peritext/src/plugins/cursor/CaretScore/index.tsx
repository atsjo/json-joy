import * as React from 'react';
import {keyframes, rule} from 'nano-theme';
import useHarmonicIntervalFn from 'react-use/lib/useHarmonicIntervalFn';
import useInterval from 'react-use/lib/useInterval';
import {useCursorPlugin} from '../context';

const ms = 350;

const scoreAnimation = keyframes({
  from: {
    op: 0.8,
    tr: 'scale(1)',
  },
  to: {
    op: 0,
    // tr: 'translateX(-2px)',
    tr: 'scale(1.5) translateY(-.5em) translateX(+.5em)',
    vis: 'hidden',
  },
});

const shakingAnimation = keyframes({
  '0%': {tr: 'translateX(0), scale(1.2)', op: 1},
  '10%': {tr: 'translateX(-2px)'},
  '20%': {tr: 'translateX(2px)'},
  '30%': {tr: 'translateX(-1px)'},
  '40%': {tr: 'translateX(1px)'},
  '50%': {tr: 'translateX(0), scale(1)'},
  '60%': {tr: 'translateX(-1px)'},
  '70%': {tr: 'translateX(1px)'},
  '80%': {tr: 'translateX(-1px)'},
  '90%': {tr: 'translateX(1px)'},
  '100%': {tr: 'translateX(0)'},
  // '100%': {op: 0, vis: 'hidden'},
});

const scoreClass = rule({
  ff: 'Inter, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  pos: 'absolute',
  bg: 'var(--caret-color)',
  d: 'inline-block',
  bdrad: '4px',
  pd: '1px 2px',
  minW: '8px',
  h: '8px',
  ta: 'center',
  lh: '8px',
  fw: 'bold',

  col: 'white',
  // b: 'calc(--caret-height / 2.2)',
  // b: '2.2em',
  t: '-10px',
  l: '5px',
  fz: '.4em',
  // an: scoreAnimation + ' .5s ease-out forwards',
  ws: 'nowrap',
  pe: 'none',
  us: 'none',
});

const scoreDeltaClass = rule({
  pos: 'absolute',
  b: 'calc(--caret-height / 2 + 0.5em)',
  l: '.5em',
  fz: '.5em',
  fw: 'bold',
  // op: 0.5,
  bg: 'rgba(255,255,255,0.5)',
  col: 'var(--caret-color)',
  an: scoreAnimation + ' .3s ease-out forwards',
  pe: 'none',
  us: 'none',
});

export type CaretScoreProps = {};

export const CaretScore: React.FC<CaretScoreProps> = React.memo(() => {
  const plugin = useCursorPlugin();
  const score = plugin.score.value;
  const delta = plugin.scoreDelta.value;
  // biome-ignore lint: lint/correctness/useExhaustiveDependencies
  React.useEffect(() => {
    plugin.lastVisScore.value = score;
  }, []);
  const [show, setShow] = React.useState(true);
  useHarmonicIntervalFn(() => setShow(Date.now() % (ms + ms) > ms), ms);
  const now = Date.now();
  const timeDiff = now - plugin.lastScoreTime.value;
  const visible = timeDiff <= 1000;
  const [, setCnt] = React.useState(0);
  useInterval(
    () => {
      setCnt((c) => c + 1);
    },
    visible ? 100 : null,
  );

  if (!visible || score < 24) return null;

  const scoreMsg =
    score > 100 && score <= 120
      ? 'Typing Spree!'
      : score > 200 && score <= 208
        ? 'Go, go, go!'
        : score > 300 && score <= 320
          ? 'Rampage!'
          : score > 400 && score <= 408
            ? "Let's go!"
            : score > 500 && score <= 520
              ? 'Unstoppable!'
              : score > 600 && score <= 608
                ? 'Good stuff!'
                : score > 700 && score <= 708
                  ? 'Alright, alright!'
                  : score > 1000 && score <= 1030
                    ? 'Godlike!'
                    : score > 1500 && score <= 1530
                      ? 'Bingo, bango, bongo!'
                      : score > 2000 && score <= 2030
                        ? 'Legendary!'
                        : score > 3000 && score <= 3040
                          ? 'Beyond Godlike!'
                          : score > 5000 && score <= 5040
                            ? 'Wicked Sick!'
                            : score > 10000 && score <= 10050
                              ? 'Monster Type!'
                              : score > 20000 && score <= 20050
                                ? 'Ultra Type!'
                                : score > 50000 && score <= 50100
                                  ? 'M-M-M-Monster Type!'
                                  : score;

  return (
    <>
      {score > 42 && delta > 1 && timeDiff < 500 ? (
        <span contentEditable={false} className={scoreDeltaClass}>
          +{delta}
        </span>
      ) : (
        score >= 24 && (
          <span contentEditable={false} className={scoreClass} style={{
            visibility: show ? 'visible' : 'hidden',
            animation: typeof scoreMsg !== 'string' ? undefined : shakingAnimation + ' .5s ease-out forwards',
          }}>
            {scoreMsg}
          </span>
        )
      )}
    </>
  );
});
