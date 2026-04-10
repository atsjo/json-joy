/**
 * RLE (Run-Length Encoding) for unsigned integers. Literal values are encoded
 * as-is, repeat sequence are encoded as negative number, which specifies how
 * many more times the previous value is repeated.
 *
 * For example, the sequence `[1, 1, 1, 2, 3, 3]` would be encoded as `[1, -2, 2, 3, -1]`.
 */
export const rle = (uint: number[]): number[] => {
  const length = uint.length;
  if (!length) return [];
  let last = uint[0];
  let repeats = 0;
  const encoded: number[] = [last];
  for (let i = 1; i < length; i++) {
    const value = uint[i];
    if (value === last) repeats++;
    else {
      if (repeats) encoded.push(-repeats);
      encoded.push(value);
      last = value;
      repeats = 0;
    }
  }
  if (repeats) encoded.push(-repeats);
  return encoded;
};

/**
 * RLD (Run-Length Decoding) for unsigned integers. Decodes an array encoded
 * with the {@link rle} function back to its original form.
 */
export const rld = (encoded: number[]): number[] => {
  const result: number[] = [];
  let last: number | undefined;
  for (const value of encoded) {
    if (value < 0) {
      if (last !== undefined) {
        for (let i = 0; i < -value; i++) {
          result.push(last);
        }
      }
    } else {
      result.push(value);
      last = value;
    }
  }
  return result;
};

/**
 * Data RLE (Run-Length Encoding) for arbitrary data. Similar to {@link rle}, but
 * with arbitrarily complex POJO objects. Records repeats only of missing items
 * (null or undefined), other items are copied over as-is. A run of missing items
 * is recorded as `null` followed by a count of how many missing items there are.
 * 
 * For example, the sequence `[{}, null, null, 3]` would be encoded as `[{}, null, 2, 3]`.
 *
 * @param data List of arbitrary POJO data structures.
 */
export const drle = (data: unknown[]): unknown[] => {
  const length = data.length;
  if (!length) return [];
  const first = data[0];
  let missing = first == null;
  const encoded: unknown[] = missing ? [null, 1] : [first];
  for (let i = 1; i < length; i++) {
    const value = data[i];
    if (value != null) {
      missing = false;
      encoded.push(value);
    } else {
      const prev = encoded.length - 1;
      if (missing) {
        encoded[prev] = (encoded[prev] as number) + 1;
      } else {
        missing = true;
        encoded.push(null, 1);
      }
    }
  }
  return encoded;
};

/**
 * Data RLD (Run-Length Decoding) for arbitrary data. Decodes an array encoded
 * with the {@link drle} function back to its original form.
 */
export const drld = (encoded: unknown[]): unknown[] => {
  const result: unknown[] = [];
  const length = encoded.length;
  for (let i = 0; i < length; i++) {
    const value = encoded[i];
    if (value === null) {
      const count = encoded[++i] as number;
      for (let j = 0; j < count; j++) result.push(null);
    } else result.push(value);
  }
  return result;
};

/**
 * Delta encoding for unsigned integers. Encodes an array of unsigned integers as
 * a sequence of deltas (differences between consecutive values). The first value
 * is encoded as-is, and subsequent values are encoded as the difference from
 * the previous value.
 */
export const de = (uint: number[]): number[] => {
  const length = uint.length;
  if (!length) return [];
  let last = uint[0];
  const encoded: number[] = [last];
  for (let i = 1; i < length; i++) {
    const value = uint[i];
    encoded.push(value - last);
    last = value;
  }
  return encoded;
};

/**
 * Delta decoding for unsigned integers. Decodes an array encoded with
 * the {@link de} function back to its original form.
 */
export const dd = (encoded: number[]): number[] => {
  const length = encoded.length;
  if (!length) return [];
  let curr = encoded[0];
  const uint: number[] = [curr];
  for (let i = 1; i < length; i++) uint.push(curr += encoded[i]);
  return uint;
};

/**
 * Zigzag encoding for signed integers. Encodes signed integers as unsigned
 * integers by mapping negative numbers to odd positive numbers and non-negative
 * numbers to even positive numbers.
 *
 * For example, the sequence `[-1, 0, 1, -2, 2]` would be encoded as `[1, 0, 2, 3, 4]`.
 */
export const ze = (int: number[]): number[] => {
  const encoded: number[] = [];
  for (const value of int) encoded.push(value >= 0 ? value * 2 : -value * 2 - 1);
  return encoded;
};

/**
 * Zigzag decoding for signed integers. Decodes an array encoded with
 * the {@link ze} function back to its original form.
 */
export const zd = (encoded: number[]): number[] => {
  const int: number[] = [];
  for (const value of encoded) int.push(value & 1 ? -(value + 1) / 2 : value / 2);
  return int;
};
