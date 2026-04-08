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
