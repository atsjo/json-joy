import {de, dd, rld, rle, ze, zd, drle, drld} from "../util";

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

describe('drle()', () => {
  test('encodes empty array', () => {
    expect(drle([])).toEqual([]);
  });

  test('encodes array with no repeats', () => {
    expect(drle([{}, null, 3])).toEqual([{}, null, 1, 3]);
  });

  test.only('encodes array with repeats', () => {
    expect(drle([{}, null, null, 3])).toEqual([{}, null, 2, 3]);
  });

  test('encodes array with all repeats', () => {
    expect(drle([null, null, null])).toEqual([null, 3]);
  });

  test('one repeat', () => {
    expect(drle([null])).toEqual([null, 1]);
  });

  test('two repeats', () => {
    expect(drle([null, null])).toEqual([null, 2]);
  });

  test('encodes array with non-consecutive repeats', () => {
    expect(drle([{}, null, null, 3, null, null, null])).toEqual([{}, null, 2, 3, null, 3]);
  });

  test('no repeats', () => {
    expect(drle([{}, 1, 2])).toEqual([{}, 1, 2]);
  });
});

describe('drle() and drld() roundtrip', () => {
  const assertRoundtrip = (input: unknown[]) => {
    const encoded = drle(input);
    const decoded = drld(encoded);
    expect(decoded).toEqual(input);
  };

  test('roundtrips empty array', () => {
    assertRoundtrip([]);
  });

  test('roundtrips array with no repeats', () => {
    assertRoundtrip([{}, 1, 2]);
    assertRoundtrip([1]);
    assertRoundtrip(['asdf']);
    assertRoundtrip([2, 'adsf', {}, null]);
    assertRoundtrip([2, 'adsf', {}, null, {foo: 'bar'}, [1, 2, 3], null, null, undefined, 123]);
  });

  test('fuzz', () => {
    for (let i = 0; i < 100; i++) {
      const arr = Array.from({ length: i }, () => Math.random() > 0.5 ? null : {});
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

describe('ze()', () => {
  test('zigzag encodes empty array', () => {
    expect(ze([])).toEqual([]);
  });

  test('zigzag encodes array with positive integers', () => {
    expect(ze([0, 1, 2])).toEqual([0, 2, 4]);
  });

  test('zigzag encodes array with negative integers', () => {
    expect(ze([-1, -2, -3])).toEqual([1, 3, 5]);
  });

  test('zigzag encodes array with mixed integers', () => {
    expect(ze([-1, 0, 1, -2, 2])).toEqual([1, 0, 2, 3, 4]);
  });

  test('zigzag encodes array with large integers', () => {
    expect(ze([-2147483648, 2147483647])).toEqual([4294967295, 4294967294]);
  });

  // Zigzag doubles the value, so inputs must be within [-2^52, 2^52-1] to stay
  // within safe integer range. 2^52 - 1 = 4503599627370495.
  test('max encodable positive and negative values', () => {
    expect(ze([4503599627370495, -4503599627370496])).toEqual([9007199254740990, 9007199254740991]);
  });
});

describe('zd()', () => {
  test('zigzag decodes empty array', () => {
    expect(zd([])).toEqual([]);
  });

  test('zigzag decodes array with positive integers', () => {
    expect(zd([0, 2, 4])).toEqual([0, 1, 2]);
  });

  test('zigzag decodes array with negative integers', () => {
    expect(zd([1, 3, 5])).toEqual([-1, -2, -3]);
  });

  test('zigzag decodes array with mixed integers', () => {
    expect(zd([1, 0, 2, 3, 4])).toEqual([-1, 0, 1, -2, 2]);
  });

  test('zigzag decodes array with large integers', () => {
    expect(zd([4294967295, 4294967294])).toEqual([-2147483648, 2147483647]);
  });

  test('max encodable positive and negative values', () => {
    expect(zd([9007199254740990, 9007199254740991])).toEqual([4503599627370495, -4503599627370496]);
  });
});

describe('ze() and zd() roundtrip', () => {
  const assertRoundtrip = (input: number[]) => {
    expect(zd(ze(input))).toEqual(input);
  };

  test('roundtrips empty array', () => {
    assertRoundtrip([]);
  });

  test('roundtrips zero', () => {
    assertRoundtrip([0]);
  });

  test('roundtrips positive integers', () => {
    assertRoundtrip([0, 1, 2, 100, 1000]);
  });

  test('roundtrips negative integers', () => {
    assertRoundtrip([-1, -2, -3, -100, -1000]);
  });

  test('roundtrips mixed integers', () => {
    assertRoundtrip([-1, 0, 1, -2, 2]);
  });

  test('roundtrips 32-bit boundary values', () => {
    assertRoundtrip([-2147483648, 2147483647]);
  });

  // Zigzag doubles the value; max safe input is floor(MAX_SAFE_INTEGER / 2) = 2^52 - 1.
  test('roundtrips max encodable boundary values', () => {
    assertRoundtrip([4503599627370495, -4503599627370496]);
  });

  test('fuzz with small values', () => {
    for (let i = 0; i < 100; i++) {
      const arr: number[] = [];
      for (let j = 0; j < i; j++) arr.push(Math.floor(Math.random() * 200) - 100);
      assertRoundtrip(arr);
    }
  });

  test('fuzz with large values', () => {
    const MAX_INPUT = Math.floor(Number.MAX_SAFE_INTEGER / 2); // 2^52 - 1
    for (let i = 0; i < 100; i++) {
      const arr: number[] = [];
      for (let j = 0; j < i; j++) {
        const sign = Math.random() < 0.5 ? 1 : -1;
        arr.push(sign * Math.floor(Math.random() * MAX_INPUT));
      }
      assertRoundtrip(arr);
    }
  });
});
