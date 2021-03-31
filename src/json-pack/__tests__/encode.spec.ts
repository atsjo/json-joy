import {encode} from '../encode';

describe('null', () => {
  test('encodes null', () => {
    const buf = encode(null);
    expect([...new Uint8Array(buf)]).toEqual([0xc0]);
  });
});

describe('boolean', () => {
  test('encodes false', () => {
    const buf = encode(false);
    expect([...new Uint8Array(buf)]).toEqual([0xc2]);
  });

  test('encodes true', () => {
    const buf = encode(true);
    expect([...new Uint8Array(buf)]).toEqual([0xc3]);
  });
});

describe('number', () => {
  test('encodes positive fixint', () => {
    const ints = [0, 1, 2, 0b10, 0b100, 0b1000, 0b10000, 0b100000, 0b1000000, 0x7f];
    for (const int of ints) expect([...new Uint8Array(encode(int))]).toEqual([int]);
  });

  test('encodes negative fixint', () => {
    const ints = [-1, -2, -3, -4, -0b11110, -0b11111, -0b100000];
    const res = [0xe0, 0b11100001, 0b11100010, 0b11100011, 0b11111101, 0b11111110, 0b11111111];
    for (let i = 0; i < ints.length; i++) expect([...new Uint8Array(encode(ints[i]))]).toEqual([res[i]]);
  });

  test('encodes doubles', () => {
    const buf = encode(123.456789123123);
    expect(buf.byteLength).toBe(9);
    const view = new DataView(buf);
    expect(view.getUint8(0)).toBe(0xcb);
    expect(view.getFloat64(1)).toBe(123.456789123123);
  });
});

describe('string', () => {
  test('encodes a zero length string', () => {
    const buf = encode('');
    expect(buf.byteLength).toBe(1);
    expect([...new Uint8Array(buf)]).toEqual([0b10100000]);
  });

  test('encodes a one char string', () => {
    const buf = encode('a');
    expect(buf.byteLength).toBe(2);
    expect([...new Uint8Array(buf)]).toEqual([0b10100001, 97]);
  });

  test('encodes a short string', () => {
    const buf = encode('foo');
    expect(buf.byteLength).toBe(4);
    expect([...new Uint8Array(buf)]).toEqual([0b10100011, 102, 111, 111]);
  });

  test('encodes 31 char string', () => {
    const buf = encode('1234567890123456789012345678901');
    expect(buf.byteLength).toBe(32);
    expect([...new Uint8Array(buf)]).toEqual([0b10111111, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 49]);
  });

  test('encodes 255 char string', () => {
    const buf = encode('a'.repeat(255));
    expect(buf.byteLength).toBe(257);
    expect([...new Uint8Array(buf)]).toEqual([0xd9, 255, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97]);
  });

  test('encodes 2000 char string', () => {
    const buf = encode('ab'.repeat(1000));
    expect(buf.byteLength).toBe(2003);
    const view = new DataView(buf);
    expect(view.getUint8(0)).toBe(0xda);
    expect(view.getUint16(1)).toBe(2000);
  });

  test('encodes 0xFFFF char string', () => {
    const buf = encode('b'.repeat(0xFFFF));
    expect(buf.byteLength).toBe(0xFFFF + 3);
    const view = new DataView(buf);
    expect(view.getUint8(0)).toBe(0xda);
    expect(view.getUint16(1)).toBe(0xFFFF);
  });

  test('encodes 0xFFFF + 1 char string', () => {
    const buf = encode('d'.repeat(0xFFFF + 1));
    expect(buf.byteLength).toBe(0xFFFF + 1 + 5);
    const view = new DataView(buf);
    expect(view.getUint8(0)).toBe(0xdb);
    expect(view.getUint32(1)).toBe(0xFFFF + 1);
  });
});
