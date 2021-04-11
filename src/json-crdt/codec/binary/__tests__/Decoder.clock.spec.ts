import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';

const encoder = new Encoder();
const decoder = new Decoder();
const encode = (x: number, z: number): Uint8Array => {
  encoder.reset();
  encoder.clock(x, z);
  return encoder.flush();
};
const decode = (uint8: Uint8Array): [number, number] => {
  decoder.reset(uint8);
  return decoder.clock();
};

const ids: [number, number][] = [
  [0, 0],
  [1, 1],
  [0b11111_11111111_00000000_10101010_01010101_11110000_00001111, 0b10_11110000],
  [0b11111_11111111_00000000_10101010_01010101_11110000_00001111, 0b1_10_11110000],
  [0b11111_11111111_00000000_10101010_01010101_11110000_00001111, 0b1_1111000_10_11110000],
  [0b11111_11111111_00000000_10101010_01010101_11110000_00001111, 0b1_0101011_1111000_10_11110000],
  [0b11111_11111111_00000000_10101010_01010101_11110000_00001111, 0b1_0000001_0101011_1111000_10_11110000],
];

test('decodes integers correctly', () => {
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    expect(decode(encode(id[0], id[1]))).toEqual(id);
  }
});
