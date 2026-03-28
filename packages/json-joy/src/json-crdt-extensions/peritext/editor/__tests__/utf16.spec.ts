import {setupKit} from '../../__tests__/setup';

/**
 * Tests for UTF-16 grapheme cluster handling in Editor.vstep().
 *
 * The RGA stores UTF-16 code units. These tests verify that vstep() correctly
 * moves the cursor past whole grapheme clusters (emoji, combining marks, ZWJ
 * sequences) rather than stopping between surrogate pairs or combining
 * characters.
 */

const setupWithText = (text: string) => {
  return setupKit('', (model) => {
    const str = model.s.text.toExt().text();
    str.ins(0, text);
  });
};

describe('Editor.vstep() — UTF-16 grapheme clusters', () => {
  describe('surrogate pairs (emoji)', () => {
    test('move right past a surrogate-pair emoji', () => {
      const {editor, peritext} = setupWithText('a🍪b');
      // "a🍪b" = 'a' (1 CU) + 🍪 (2 CU) + 'b' (1 CU) = 4 code units
      expect(peritext.strApi().view()).toBe('a🍪b');
      editor.cursor.setAt(0);
      const point = editor.cursor.start.clone();
      // Step right once: 'a' - skip past 'a'
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(1); // after 'a'
      // Step right again: should skip the entire 🍪 (2 code units)
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(3); // after 🍪 (offset 1+2=3)
      // Step right again: should land after 'b'
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(4);
    });

    test('move left past a surrogate-pair emoji', () => {
      const {editor, peritext} = setupWithText('a🍪b');
      expect(peritext.strApi().view()).toBe('a🍪b');
      editor.cursor.setAt(4); // after 'b'
      const point = editor.cursor.start.clone();
      // Step left once: 'b' - skip back past 'b'
      editor.vstep(point, -1);
      expect(point.viewPos()).toBe(3);
      // Step left again: should skip the entire 🍪 (2 code units)
      editor.vstep(point, -1);
      expect(point.viewPos()).toBe(1); // before 🍪
      // Step left again: should land before 'a'
      editor.vstep(point, -1);
      expect(point.viewPos()).toBe(0);
    });

    test('emoji at the beginning of text', () => {
      const {editor, peritext} = setupWithText('🎉hello');
      expect(peritext.strApi().view()).toBe('🎉hello');
      editor.cursor.setAt(0);
      const point = editor.cursor.start.clone();
      // Step right: should skip entire 🎉 (2 code units)
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(2);
    });

    test('emoji at the end of text', () => {
      const {editor, peritext} = setupWithText('hello🎉');
      expect(peritext.strApi().view()).toBe('hello🎉');
      editor.cursor.setAt(7); // 5 + 2 = 7
      const point = editor.cursor.start.clone();
      // Step left: should skip entire 🎉 (2 code units)
      editor.vstep(point, -1);
      expect(point.viewPos()).toBe(5);
    });

    test('multiple consecutive emoji', () => {
      const {editor, peritext} = setupWithText('🍪🍩🍰');
      // 3 emoji × 2 CU = 6 code units
      expect(peritext.strApi().view()).toBe('🍪🍩🍰');
      editor.cursor.setAt(0);
      const point = editor.cursor.start.clone();
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(2); // after 🍪
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(4); // after 🍩
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(6); // after 🍰
    });

    test('multiple consecutive emoji — backward', () => {
      const {editor, peritext} = setupWithText('🍪🍩🍰');
      expect(peritext.strApi().view()).toBe('🍪🍩🍰');
      editor.cursor.setAt(6);
      const point = editor.cursor.start.clone();
      editor.vstep(point, -1);
      expect(point.viewPos()).toBe(4); // before 🍰
      editor.vstep(point, -1);
      expect(point.viewPos()).toBe(2); // before 🍩
      editor.vstep(point, -1);
      expect(point.viewPos()).toBe(0); // before 🍪
    });
  });

  describe('combining characters', () => {
    test('move right past e + combining acute (é)', () => {
      const {editor, peritext} = setupWithText('cafe\u0301s');
      // "café s" but the é is decomposed: e (1 CU) + ◌́ (1 CU) = 2 CU
      // Total: c(1) a(1) f(1) e(1) ◌́(1) s(1) = 6 CU
      expect(peritext.strApi().view()).toBe('cafe\u0301s');
      editor.cursor.setAt(0);
      const point = editor.cursor.start.clone();
      editor.vstep(point, 1); // c
      expect(point.viewPos()).toBe(1);
      editor.vstep(point, 1); // a
      expect(point.viewPos()).toBe(2);
      editor.vstep(point, 1); // f
      expect(point.viewPos()).toBe(3);
      // Next step should skip 'e' + combining acute together
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(5); // after é (e+◌́)
      editor.vstep(point, 1); // s
      expect(point.viewPos()).toBe(6);
    });

    test('move left past e + combining acute (é)', () => {
      const {editor, peritext} = setupWithText('cafe\u0301s');
      editor.cursor.setAt(6);
      const point = editor.cursor.start.clone();
      editor.vstep(point, -1); // s <-
      expect(point.viewPos()).toBe(5);
      // Next step should skip é (e+◌́) together
      editor.vstep(point, -1);
      expect(point.viewPos()).toBe(3); // before é
      editor.vstep(point, -1); // f <-
      expect(point.viewPos()).toBe(2);
    });
  });

  describe('ZWJ sequences', () => {
    test('move right past family emoji (👨‍👩‍👧‍👦)', () => {
      const {editor, peritext} = setupWithText('a👨\u200D👩\u200D👧\u200D👦b');
      const text = peritext.strApi().view();
      expect(text).toBe('a👨\u200D👩\u200D👧\u200D👦b');
      // 'a' (1) + 👨(2) + ZWJ(1) + 👩(2) + ZWJ(1) + 👧(2) + ZWJ(1) + 👦(2) + 'b'(1) = 13 CU
      const familyLen = text.length - 2; // minus 'a' and 'b'
      editor.cursor.setAt(0);
      const point = editor.cursor.start.clone();
      editor.vstep(point, 1); // past 'a'
      expect(point.viewPos()).toBe(1);
      // Next step should skip entire family emoji
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(1 + familyLen);
      editor.vstep(point, 1); // past 'b'
      expect(point.viewPos()).toBe(1 + familyLen + 1);
    });

    test('move left past family emoji', () => {
      const {editor, peritext} = setupWithText('a👨\u200D👩\u200D👧\u200D👦b');
      const text = peritext.strApi().view();
      const totalLen = text.length;
      const familyLen = totalLen - 2;
      editor.cursor.setAt(totalLen);
      const point = editor.cursor.start.clone();
      editor.vstep(point, -1); // past 'b'
      expect(point.viewPos()).toBe(totalLen - 1);
      // Next step should skip entire family emoji
      editor.vstep(point, -1);
      expect(point.viewPos()).toBe(1); // before family
      editor.vstep(point, -1); // past 'a'
      expect(point.viewPos()).toBe(0);
    });
  });

  describe('flag emoji (regional indicators)', () => {
    test('move right past flag emoji 🇺🇸', () => {
      const {editor, peritext} = setupWithText('x\uD83C\uDDFA\uD83C\uDDF8y');
      // 'x'(1) + 🇺(2) + 🇸(2) + 'y'(1) = 6 CU
      const text = peritext.strApi().view();
      expect(text.length).toBe(6);
      editor.cursor.setAt(0);
      const point = editor.cursor.start.clone();
      editor.vstep(point, 1); // past 'x'
      expect(point.viewPos()).toBe(1);
      // Next step should skip entire flag (4 code units)
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(5);
      editor.vstep(point, 1); // past 'y'
      expect(point.viewPos()).toBe(6);
    });

    test('move left past flag emoji 🇺🇸', () => {
      const {editor, peritext} = setupWithText('x\uD83C\uDDFA\uD83C\uDDF8y');
      const text = peritext.strApi().view();
      editor.cursor.setAt(text.length);
      const point = editor.cursor.start.clone();
      editor.vstep(point, -1); // past 'y'
      expect(point.viewPos()).toBe(5);
      // Next step should skip entire flag (4 code units)
      editor.vstep(point, -1);
      expect(point.viewPos()).toBe(1);
      editor.vstep(point, -1); // past 'x'
      expect(point.viewPos()).toBe(0);
    });
  });

  describe('emoji with skin tone modifier', () => {
    test('move right past 👍🏽', () => {
      const {editor, peritext} = setupWithText('a👍🏽b');
      const text = peritext.strApi().view();
      // 'a'(1) + 👍(2) + 🏽(2) + 'b'(1) = 6 CU
      expect(text.length).toBe(6);
      editor.cursor.setAt(0);
      const point = editor.cursor.start.clone();
      editor.vstep(point, 1); // past 'a'
      expect(point.viewPos()).toBe(1);
      // Should skip 👍🏽 as one grapheme (4 code units)
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(5);
      editor.vstep(point, 1); // past 'b'
      expect(point.viewPos()).toBe(6);
    });

    test('move left past 👍🏽', () => {
      const {editor, peritext} = setupWithText('a👍🏽b');
      const text = peritext.strApi().view();
      editor.cursor.setAt(text.length);
      const point = editor.cursor.start.clone();
      editor.vstep(point, -1); // past 'b'
      expect(point.viewPos()).toBe(5);
      // Should skip 👍🏽 as one grapheme (4 code units)
      editor.vstep(point, -1);
      expect(point.viewPos()).toBe(1);
    });
  });

  describe('mixed content', () => {
    test('traverse "hello🌍world" start to end', () => {
      const {editor, peritext} = setupWithText('hello🌍world');
      const text = peritext.strApi().view();
      // 'hello'(5) + 🌍(2) + 'world'(5) = 12 CU
      expect(text.length).toBe(12);
      editor.cursor.setAt(0);
      const point = editor.cursor.start.clone();
      const positions: number[] = [0];
      for (let i = 0; i < 11; i++) {
        editor.vstep(point, 1);
        positions.push(point.viewPos());
      }
      // Chars: h(1) e(2) l(3) l(4) o(5) 🌍(7) w(8) o(9) r(10) l(11) d(12)
      expect(positions).toEqual([0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]);
    });

    test('traverse "hello🌍world" end to start', () => {
      const {editor, peritext} = setupWithText('hello🌍world');
      const text = peritext.strApi().view();
      editor.cursor.setAt(text.length);
      const point = editor.cursor.start.clone();
      const positions: number[] = [text.length];
      for (let i = 0; i < 11; i++) {
        editor.vstep(point, -1);
        positions.push(point.viewPos());
      }
      expect(positions).toEqual([12, 11, 10, 9, 8, 7, 5, 4, 3, 2, 1, 0]);
    });

    test('plain ASCII is unaffected (no performance regression)', () => {
      const {editor, peritext} = setupWithText('abcdef');
      expect(peritext.strApi().view()).toBe('abcdef');
      editor.cursor.setAt(0);
      const point = editor.cursor.start.clone();
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(1);
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(2);
      editor.vstep(point, 1);
      expect(point.viewPos()).toBe(3);
    });
  });
});

describe('Editor.del() — UTF-16 grapheme cluster deletion', () => {
  describe('forward delete (Delete key)', () => {
    test('delete a surrogate-pair emoji forward', () => {
      const {editor, peritext} = setupWithText('a🍪b');
      // "a🍪b" = 'a'(1) + 🍪(2) + 'b'(1) = 4 CU
      editor.cursor.setAt(1); // between 'a' and 🍪
      editor.del(1); // forward delete
      expect(peritext.strApi().view()).toBe('ab');
    });

    test('delete a combining character sequence forward', () => {
      const {editor, peritext} = setupWithText('cafe\u0301s');
      // c(1) a(1) f(1) e(1) ◌́(1) s(1) = 6 CU
      editor.cursor.setAt(3); // before 'e' + combining acute
      editor.del(1);
      expect(peritext.strApi().view()).toBe('cafs');
    });

    test('delete a ZWJ family emoji forward', () => {
      const {editor, peritext} = setupWithText('a👨\u200D👩\u200D👧\u200D👦b');
      const before = peritext.strApi().view();
      expect(before).toBe('a👨\u200D👩\u200D👧\u200D👦b');
      editor.cursor.setAt(1); // after 'a', before family emoji
      editor.del(1);
      expect(peritext.strApi().view()).toBe('ab');
    });

    test('delete a flag emoji forward', () => {
      const {editor, peritext} = setupWithText('x\uD83C\uDDFA\uD83C\uDDF8y');
      editor.cursor.setAt(1); // after 'x'
      editor.del(1);
      expect(peritext.strApi().view()).toBe('xy');
    });

    test('delete emoji with skin tone forward', () => {
      const {editor, peritext} = setupWithText('a👍🏽b');
      editor.cursor.setAt(1); // after 'a'
      editor.del(1);
      expect(peritext.strApi().view()).toBe('ab');
    });

    test('delete plain ASCII forward', () => {
      const {editor, peritext} = setupWithText('abc');
      editor.cursor.setAt(1); // after 'a'
      editor.del(1);
      expect(peritext.strApi().view()).toBe('ac');
    });
  });

  describe('backward delete (Backspace)', () => {
    test('delete a surrogate-pair emoji backward', () => {
      const {editor, peritext} = setupWithText('a🍪b');
      editor.cursor.setAt(3); // after 🍪, before 'b'
      editor.del(-1); // backspace
      expect(peritext.strApi().view()).toBe('ab');
    });

    test('delete a combining character sequence backward', () => {
      const {editor, peritext} = setupWithText('cafe\u0301s');
      editor.cursor.setAt(5); // after é (e + combining acute), before 's'
      editor.del(-1);
      expect(peritext.strApi().view()).toBe('cafs');
    });

    test('delete a ZWJ family emoji backward', () => {
      const {editor, peritext} = setupWithText('a👨\u200D👩\u200D👧\u200D👦b');
      const text = peritext.strApi().view();
      editor.cursor.setAt(text.length - 1); // before 'b', after family emoji
      editor.del(-1);
      expect(peritext.strApi().view()).toBe('ab');
    });

    test('delete a flag emoji backward', () => {
      const {editor, peritext} = setupWithText('x\uD83C\uDDFA\uD83C\uDDF8y');
      editor.cursor.setAt(5); // after flag, before 'y'
      editor.del(-1);
      expect(peritext.strApi().view()).toBe('xy');
    });

    test('delete emoji with skin tone backward', () => {
      const {editor, peritext} = setupWithText('a👍🏽b');
      editor.cursor.setAt(5); // after 👍🏽, before 'b'
      editor.del(-1);
      expect(peritext.strApi().view()).toBe('ab');
    });

    test('delete plain ASCII backward', () => {
      const {editor, peritext} = setupWithText('abc');
      editor.cursor.setAt(2); // after 'b'
      editor.del(-1);
      expect(peritext.strApi().view()).toBe('ac');
    });
  });

  describe('consecutive deletions', () => {
    test('delete multiple emoji one by one forward', () => {
      const {editor, peritext} = setupWithText('🍪🍩🍰');
      editor.cursor.setAt(0);
      editor.del(1);
      expect(peritext.strApi().view()).toBe('🍩🍰');
      editor.del(1);
      expect(peritext.strApi().view()).toBe('🍰');
      editor.del(1);
      expect(peritext.strApi().view()).toBe('');
    });

    test('delete multiple emoji one by one backward', () => {
      const {editor, peritext} = setupWithText('🍪🍩🍰');
      editor.cursor.setAt(6); // end
      editor.del(-1);
      expect(peritext.strApi().view()).toBe('🍪🍩');
      editor.del(-1);
      expect(peritext.strApi().view()).toBe('🍪');
      editor.del(-1);
      expect(peritext.strApi().view()).toBe('');
    });
  });
});
