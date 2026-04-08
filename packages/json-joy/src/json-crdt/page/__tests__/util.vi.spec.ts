import {de, dd, rld, rle} from "../util";

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

describe('de()', () => {
  test('delta encodes empty array', () => {
    expect(de([])).toEqual([]);
  });

  test('delta encodes array with no changes', () => {
    expect(de([1, 2, 3])).toEqual([1, 1, 1]);
  });

  test('delta encodes array with changes', () => {
    expect(de([1, 3, 6])).toEqual([1, 2, 3]);
  });

  test('delta encodes array with negative changes', () => {
    expect(de([5, 3, 4])).toEqual([5, -2, 1]);
  });

  test('delta encodes array with mixed changes', () => {
    expect(de([10, 15, 12, 20])).toEqual([10, 5, -3, 8]);
  });
});

describe('dd()', () => {
  test('delta decodes empty array', () => {
    expect(dd([])).toEqual([]);
  });

  test('delta decodes array with no changes', () => {
    expect(dd([1, 1, 1])).toEqual([1, 2, 3]);
  });

  test('delta decodes array with changes', () => {
    expect(dd([1, 2, 3])).toEqual([1, 3, 6]);
  });

  test('delta decodes array with negative changes', () => {
    expect(dd([5, -2, 1])).toEqual([5, 3, 4]);
  });

  test('delta decodes array with mixed changes', () => {
    expect(dd([10, 5, -3, 8])).toEqual([10, 15, 12, 20]);
  });
});

describe('de() and dd() roundtrip', () => {
  const assertRoundtrip = (input: number[]) => {
    const encoded = de(input);
    const decoded = dd(encoded);
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

  test('roundtrips array with no changes', () => {
    assertRoundtrip([1, 2, 3]);
  });

  test('fuzz', () => {
    for (let i = 0; i < 100; i++) {
      const arr = randomArray(i, 100);
      assertRoundtrip(arr);
    }
  });
});
