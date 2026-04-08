import {rld, rle} from "../util";

describe('rle()', () => {
  test('encodes empty array', () => {
    expect(rle([])).toEqual([]);
  });

  test('encodes array with no repeats', () => {
    expect(rle([1, 2, 3])).toEqual([1, 2, 3]);
  });
  
  test('encodes array with repeats', () => {
    expect(rle([1, 1, 1, 2, 3, 3])).toEqual([1, -2, 2, 3, -1]);
  });

  test('encodes array with all repeats', () => {
    expect(rle([1, 1, 1, 1])).toEqual([1, -3]);
  });

  test('encodes array with single repeat', () => {
    expect(rle([1, 1])).toEqual([1, -1]);
  });

  test('encodes array with non-consecutive repeats', () => {
    expect(rle([1, 2, 2, 3, 1, 1])).toEqual([1, 2, -1, 3, 1, -1]);
  });

  test('encodes array with long repeats', () => {
    expect(rle([2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])).toEqual([2, 1, -9]);
  });
});

describe('rld()', () => {
  test('decodes empty array', () => {
    expect(rld([])).toEqual([]);
  });

  test('decodes array with no repeats', () => {
    expect(rld([1, 2, 3])).toEqual([1, 2, 3]);
  });
  
  test('decodes array with repeats', () => {
    expect(rld([1, -2, 2, 3, -1])).toEqual([1, 1, 1, 2, 3, 3]);
  });

  test('decodes array with all repeats', () => {
    expect(rld([1, -3])).toEqual([1, 1, 1, 1]);
  });

  test('decodes array with single repeat', () => {
    expect(rld([1, -1])).toEqual([1, 1]);
  });

  test('decodes array with non-consecutive repeats', () => {
    expect(rld([1, 2, -1, 3, 1, -1])).toEqual([1, 2, 2, 3, 1, 1]);
  });

  test('decodes array with long repeats', () => {
    expect(rld([2, 1, -9])).toEqual([2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  });
});

describe('rle() and rld() roundtrip', () => {
  const assertRoundtrip = (input: number[]) => {
    const encoded = rle(input);
    const decoded = rld(encoded);
    expect(decoded).toEqual(input);
  };

  const randomArray = (length: number, maxValue: number): number[] => {
    const arr: number[] = [];
    for (let i = 0; i < length; i++) {
      arr.push(Math.floor(Math.random() * maxValue));
    }
    return arr;
  };

  test('roundtrips empty array', () => {
    assertRoundtrip([]);
  });

  test('roundtrips array with no repeats', () => {
    assertRoundtrip([1, 2, 3]);
  });

  test('fuzz', () => {
    for (let i = 0; i < 100; i++) {
      const arr = randomArray(i, 10);
      assertRoundtrip(arr);
    }
  });
});
