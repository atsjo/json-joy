import {type Kit, runNumbersKitTestSuite} from '../../__tests__/setup';
import {SliceStacking} from '../../slice/constants';
import {Inline} from '../../block/Inline';

/**
 * Tests for {@link SliceStacking.Atomic} – inline indivisible, non-editable
 * islands. The test document is "0123456789" and we typically place an Atomic
 * slice over characters "345" (offset 3, length 3).
 */

const testSuite = (setup: () => Kit): void => {
  const paddedCases = [true, false];

  for (const padded of paddedCases) {
    const setupWithAtom = (setup: () => Kit) => {
      const kit = setup();
      const {peritext} = kit;
      const range = peritext.rangeAt(3, 3); // covers "345"
      const atom = peritext.savedSlices.insAtomic(range, 'math', {tex: 'x^2'}, padded);
      peritext.overlay.refresh();
      return {...kit, atom};
    };

    describe(`padded = ${padded}`, () => {
      describe('Slices.insAtomic()', () => {
        test('creates an Atomic slice with correct type and data', () => {
          const {atom} = setupWithAtom(setup);
          expect(atom.stacking).toBe(SliceStacking.Atomic);
          expect(atom.type()).toBe('math');
          expect(atom.data()).toStrictEqual({tex: 'x^2'});
        });

        test('insAtomic via Slices convenience method', () => {
          const {peritext} = setup();
          const range = peritext.rangeAt(1, 2);
          const slice = peritext.savedSlices.insAtomic(range, 'chip');
          expect(slice.stacking).toBe(SliceStacking.Atomic);
          expect(slice.type()).toBe('chip');
        });

        test('insAtomic via EditorSlices convenience method', () => {
          const {editor} = setup();
          editor.cursor.setAt(2, 4); // select "2345"
          const [slice] = editor.saved.insAtomic('widget', 42);
          expect(slice.stacking).toBe(SliceStacking.Atomic);
          expect(slice.type()).toBe('widget');
          expect(slice.data()).toBe(42);
        });
      });

      describe('Inline.attr()', () => {
        test('atomic slice appears in attr with overwrite semantics (single entry)', () => {
          const {peritext} = setupWithAtom(setup);
          const overlay = peritext.overlay;
          const points = [...overlay.points()];
          // Find the inline that covers "345" (inside the atom)
          for (let i = 0; i < points.length - 1; i++) {
            const inline = new Inline(peritext, points[i], points[i + 1], points[i], points[i + 1]);
            const text = inline.text();
            if (!text) continue;
            if (text[0] >= '3' && text[0] <= '5') {
              const attr = inline.attr();
              expect(attr.math).toBeDefined();
              expect(attr.math.length).toBe(1);
              expect(attr.math[0].slice.stacking).toBe(SliceStacking.Atomic);
              expect(attr.math[0].slice.data()).toStrictEqual({tex: 'x^2'});
              break;
            }
          }
        });

        test('two Atomic slices with same type – latest wins (overwrite)', () => {
          const {peritext} = setup();
          const range = peritext.rangeAt(3, 3);
          peritext.savedSlices.insAtomic(range, 'math', {v: 1});
          peritext.savedSlices.insAtomic(range, 'math', {v: 2});
          peritext.overlay.refresh();
          const points = [...peritext.overlay.points()];
          for (let i = 0; i < points.length - 1; i++) {
            const inline = new Inline(peritext, points[i], points[i + 1], points[i], points[i + 1]);
            const text = inline.text();
            if (text && text[0] >= '3' && text[0] <= '5') {
              const attr = inline.attr();
              expect(attr.math.length).toBe(1);
              expect(attr.math[0].slice.data()).toStrictEqual({v: 2});
              break;
            }
          }
        });
      });

      describe('Inline.atomic() - inline rendering hints', () => {
        test('can detect a start of atomic slice', () => {
          const {peritext, atom} = setupWithAtom(setup);
          const overlay = peritext.overlay;
          const points = [...overlay.points()];
          let foundAtomStart = false;
          for (let i = 0; i < points.length - 1; i++) {
            const inline = new Inline(peritext, points[i], points[i + 1], points[i], points[i + 1]);
            const result = inline.atomic()?.isStart();
            if (result) {
              foundAtomStart = true;
              expect(inline.atomic()?.slice).toBe(atom);
              break;
            }
          }
          expect(foundAtomStart).toBe(true);
        });

        test('can detect atomic slice continuation', () => {
          const {peritext} = setup();
          // Place atom over "2345" so it spans at least 2 inlines if other splits exist
          const range = peritext.rangeAt(2, 4);
          peritext.savedSlices.insAtomic(range, 'chip');
          // Also add a stack annotation that splits the atom range
          const subRange = peritext.rangeAt(3, 1);
          peritext.savedSlices.ins(subRange, SliceStacking.Many, 'bold');
          peritext.overlay.refresh();
          const points = [...peritext.overlay.points()];
          let atomStartSeen = false;
          let continuationSeen = false;
          for (let i = 0; i < points.length - 1; i++) {
            const inline = new Inline(peritext, points[i], points[i + 1], points[i], points[i + 1]);
            if (inline.atomic()?.isStart()) atomStartSeen = true;
            else if (!inline.atomic()?.isStart()) continuationSeen = true;
          }
          expect(atomStartSeen).toBe(true);
          expect(continuationSeen).toBe(true);
        });
      });

      describe('cursor movement – skips over atoms', () => {
        test('vstep forward jumps to atom end', () => {
          const {peritext, editor} = setupWithAtom(setup);
          // Position cursor just before the atom (at char "2")
          const point = peritext.pointAt(3, 0); // Before char at index 3
          // Step forward once – should land past the atom
          editor.vstep(point, 1);
          // The point should have skipped over the atom "345"
          const pos = point.viewPos();
          expect(pos).toBeGreaterThanOrEqual(6); // past "345"
        });

        test('vstep backward jumps to atom start', () => {
          const {peritext, editor} = setupWithAtom(setup);
          // Position cursor just after the atom (at char "6")
          const point = peritext.pointAt(5, 1); // After char at index 5
          // Step backward once – should jump before the atom
          editor.vstep(point, -1);
          const pos = point.viewPos();
          expect(pos).toBeLessThanOrEqual(3); // before "345"
        });

        test('skip with unit=char jumps past atom', () => {
          const {peritext, editor} = setupWithAtom(setup);
          const point = peritext.pointAt(2);
          const result = editor.skip(point, 1, 'char');
          const pos = result.viewPos();
          // After stepping 1 char forward from position 2 (char "2"),
          // we land at position 3 which is inside the atom, so skipAtom pushes to atom end
          expect(pos).toBeGreaterThanOrEqual(6);
        });

        test('skip with unit=point jumps past atom', () => {
          const {peritext, editor} = setupWithAtom(setup);
          const point = peritext.pointAt(2);
          const result = editor.skip(point, 1, 'point');
          const pos = result.viewPos();
          // Half-stepping forward from before char "2" enters the atom → skipAtom pushes out
          expect(pos).toBeGreaterThanOrEqual(3);
        });

        test('move() forward from inside atom skips to atom end', () => {
          const {editor} = setupWithAtom(setup);
          // Place cursor inside the atom at position 4 (char "4")
          editor.cursor.setAt(4);
          editor.move(1, 'char');
          const pos = editor.cursor.start.viewPos();
          // Moving 1 char forward from inside atom → skipped to atom end
          expect(pos).toBeGreaterThanOrEqual(6);
        });

        test('move() across atom in backward direction', () => {
          const {editor} = setupWithAtom(setup);
          editor.cursor.setAt(6); // cursor at position 6 (char "6")
          editor.move(-1, 'char');
          const pos = editor.cursor.start.viewPos();
          // Moving 1 char backward from "6" → into atom → skipped to start of atom
          expect(pos).toBeLessThanOrEqual(3);
        });
      });

      describe('text deletion – atoms deleted as a unit', () => {
        test('delete forward expands to cover entire atom', () => {
          const {peritext, editor} = setupWithAtom(setup);
          peritext.refresh();
          expect(editor.saved.slices.size()).toBe(1);
          // Place cursor at position 3 (start of atom)
          editor.cursor.setAt(3);
          editor.delete(1, 'char');
          peritext.refresh();
          const text = peritext.strApi().view();
          expect(text).not.toContain('345');
          expect(text).toBe('0126789');
          expect(editor.saved.slices.size()).toBe(0);
        });

        test('delete backward from inside atom removes entire atom', () => {
          const {peritext, editor} = setupWithAtom(setup);
          editor.cursor.setAt(5); // inside atom at "5"
          editor.delete(-1, 'char');
          peritext.refresh();
          const text = peritext.strApi().view();
          expect(text).not.toContain('345');
          expect(text).toBe('0126789');
          expect(editor.saved.slices.size()).toBe(0);
        });

        test('selecting and deleting text that partially overlaps atom removes the atom', () => {
          const {peritext, editor} = setupWithAtom(setup);
          // Select "234" – partially overlaps atom "345"
          editor.cursor.setAt(2, 3);
          editor.delete(1, 'char');
          peritext.refresh();
          const text = peritext.strApi().view();
          expect(text).not.toContain('3');
          expect(text).not.toContain('4');
          expect(text).not.toContain('5');
          expect(text).toBe('016789');
          expect(editor.saved.slices.size()).toBe(0);
        });
      });

      describe('clearFormatting – preserves Atomic slices', () => {
        test('clearFormatting does not remove Atomic slices', () => {
          const {peritext, editor} = setupWithAtom(setup);
          // Also add a regular formatting slice
          editor.cursor.setAt(2, 6);
          editor.saved.insOne('bold');
          peritext.overlay.refresh();
          // Now clear formatting over the whole range
          editor.cursor.setAt(0, 10);
          editor.clearFormatting();
          peritext.overlay.refresh();
          // The atom should survive
          let atomFound = false;
          peritext.savedSlices.forEach((slice) => {
            if (slice.stacking === SliceStacking.Atomic) atomFound = true;
          });
          expect(atomFound).toBe(true);
          editor.cursor.setAt(4);
          peritext.refresh();
          const atom = editor.atomAt(editor.cursor.start);
          expect(atom).toBeDefined();
          expect(atom?.stacking).toBe(SliceStacking.Atomic);
        });

        test('clearFormatting removes non-Atomic formatting slices', () => {
          const {peritext, editor} = setupWithAtom(setup);
          editor.cursor.setAt(1, 8);
          editor.saved.insOne('bold');
          peritext.overlay.refresh();
          const sizeBefore = peritext.savedSlices.size();
          editor.cursor.setAt(0, 10);
          editor.clearFormatting();
          peritext.overlay.refresh();
          // Should have removed at least the "bold" slice
          expect(peritext.savedSlices.size()).toBeLessThan(sizeBefore);
        });
      });

      describe('export() – includes Atomic slices', () => {
        test('export includes Atomic slice in ViewSlice list', () => {
          const {peritext, editor} = setupWithAtom(setup);
          peritext.overlay.refresh();
          const view = editor.export();
          const [, , slices] = view;
          // At least one slice should be present (the Atomic one)
          expect(slices.length).toBeGreaterThanOrEqual(1);
          // Verify the slice type matches 'math'
          const found = slices.some((s) => s[3] === 'math');
          expect(found).toBe(true);
        });

        test('exportStyle includes Atomic slice', () => {
          const {peritext, editor} = setupWithAtom(setup);
          peritext.overlay.refresh();
          const range = peritext.rangeAt(3, 3);
          const styles = editor.exportStyle(range);
          const atomicStyles = styles.filter((s) => s[0] === SliceStacking.Atomic);
          expect(atomicStyles.length).toBe(1);
          expect(atomicStyles[0][1]).toBe('math');
        });
      });

      describe('Overlay.stat() – Atomic in complete set', () => {
        test('Atomic slice type appears in stat() complete set', () => {
          const {peritext} = setupWithAtom(setup);
          const range = peritext.rangeAt(3, 3);
          const [complete] = peritext.overlay.stat(range, 100);
          expect(complete.has('math')).toBe(true);
        });

        test('Atomic slice type appears in stat() partial set when partially overlapping', () => {
          const {peritext} = setupWithAtom(setup);
          const range = peritext.rangeAt(4, 4); // partially overlaps "345"
          const [complete, partial] = peritext.overlay.stat(range, 100);
          // "math" is not fully contained in range 4..8, so it appears in partial
          expect(partial.has('math')).toBe(true);
          expect(complete.has('math')).toBe(false);
        });
      });

      describe('atomAt()', () => {
        test('returns the atom when point is inside', () => {
          const {peritext, editor, atom} = setupWithAtom(setup);
          const point = peritext.pointAt(4); // inside atom "345"
          const result = editor.atomAt(point);
          expect(result).toBe(atom);
        });

        test('returns undefined when point is outside any atom', () => {
          const {peritext, editor} = setupWithAtom(setup);
          const point = peritext.pointAt(1); // "1", outside atom
          const result = editor.atomAt(point);
          expect(result).toBeUndefined();
        });
      });

      describe('word movement - skips over atoms', () => {
        /**
         * Document: "ab X1Y fg" with "X1Y" (offset 3, length 3) as Atomic.
         * The atom content mixes letters and digits, so skipWord's predicate
         * would stop mid-atom without atom-awareness. Word-forward from "ab "
         * must NOT land inside the atom.
         */
        const setupWords = () => {
          const kit = setup();
          const {peritext} = kit;
          const str = peritext.strApi();
          str.del(0, str.length());
          str.ins(0, 'ab X1Y fg');
          // "X1Y" at offset 3, length 3 is the atom (mixed chars)
          const range = peritext.rangeAt(3, 3);
          const atom = peritext.savedSlices.insAtomic(range, 'math', {}, padded);
          peritext.overlay.refresh();
          return {...kit, atom};
        };

        test('eow() does not land inside atomic slice (mixed-char atom)', () => {
          const {peritext, editor} = setupWords();
          let point = peritext.pointAt(0);
          point = editor.eow(point);
          expect(point.viewPos()).toBe(2);
          // Second eow should skip past the atom entirely, NOT stop at 'X' inside it
          point = editor.eow(point);
          const pos = point.viewPos();
          expect(editor.atomAt(point)).toBeUndefined();
          expect(pos).toBeGreaterThanOrEqual(6);
        });

        test('bow() does not land inside atomic slice (mixed-char atom)', () => {
          const {peritext, editor} = setupWords();
          // Start at end of text
          let point = peritext.pointAt(9);
          point = editor.bow(point);
          expect(point.viewPos()).toBe(7); // before "fg"
          // Next bow should skip back past the atom, NOT stop at 'Y' inside it
          point = editor.bow(point);
          const pos = point.viewPos();
          expect(editor.atomAt(point)).toBeUndefined();
          expect(pos).toBeLessThanOrEqual(3);
        });

        test('skip(word) forward does not stop inside atom', () => {
          const {peritext, editor} = setupWords();
          const point = peritext.pointAt(0);
          const result = editor.skip(point, 2, 'word');
          expect(editor.atomAt(result)).toBeUndefined();
          expect(result.viewPos()).toBeGreaterThanOrEqual(6);
        });

        test('skip(word) backward does not stop inside atom', () => {
          const {peritext, editor} = setupWords();
          const point = peritext.pointAt(9);
          const result = editor.skip(point, -2, 'word');
          expect(editor.atomAt(result)).toBeUndefined();
          expect(result.viewPos()).toBeLessThanOrEqual(3);
        });

        test('move(word) forward does not get stuck inside atom', () => {
          const {editor} = setupWords();
          editor.cursor.setAt(0);
          editor.move(1, 'word');
          expect(editor.cursor.start.viewPos()).toBe(2);
          editor.move(1, 'word');
          const pos = editor.cursor.start.viewPos();
          expect(editor.atomAt(editor.cursor.start)).toBeUndefined();
          expect(pos).toBeGreaterThanOrEqual(6);
        });

        describe('uniform atom content (all letters)', () => {
          /**
           * Document: "ab eqn fg" with "eqn" (offset 3, length 3) as Atomic.
           * Since atom content is all letters, skipWord's predicate will NOT
           * break inside the atom. Instead it consumes the whole atom and may
           * land at or past the atom boundary where atomAt() might not detect
           * it, so skipAtom() becomes a no-op. The atom should still be treated
           * as one unit: one eow from "ab" should skip past the whole atom.
           */
          const setupUniform = () => {
            const kit = setup();
            const {peritext} = kit;
            const str = peritext.strApi();
            str.del(0, str.length());
            str.ins(0, 'ab eqn fg');
            const range = peritext.rangeAt(3, 3);
            const atom = peritext.savedSlices.insAtomic(range, 'math', {}, padded);
            peritext.overlay.refresh();
            return {...kit, atom};
          };

          test('eow() forward from before atom counts atom as one word', () => {
            const {peritext, editor} = setupUniform();
            let point = peritext.pointAt(0);
            point = editor.eow(point);
            expect(point.viewPos()).toBe(2); // end of "ab"
            // Next eow: should treat atom as one unit, landing past it
            point = editor.eow(point);
            expect(editor.atomAt(point)).toBeUndefined();
            expect(point.viewPos()).toBeGreaterThanOrEqual(6);
          });

          test('bow() backward from after atom counts atom as one word', () => {
            const {peritext, editor} = setupUniform();
            let point = peritext.pointAt(9);
            point = editor.bow(point);
            expect(point.viewPos()).toBe(7); // before "fg"
            // Next bow: should treat atom as one unit, landing before it
            point = editor.bow(point);
            expect(editor.atomAt(point)).toBeUndefined();
            expect(point.viewPos()).toBeLessThanOrEqual(3);
          });

          test('skip 3 words forward crosses atom without consuming extra words', () => {
            const {peritext, editor} = setupUniform();
            // "ab [eqn] fg" - 3 words: "ab", atom, "fg"
            const point = peritext.pointAt(0);
            const result = editor.skip(point, 3, 'word');
            // 3 word-skips: end of "ab", past atom, end of "fg"
            expect(result.viewPos()).toBe(9); // end of "fg"
          });

          test('skip 3 words backward crosses atom without consuming extra words', () => {
            const {peritext, editor} = setupUniform();
            const point = peritext.pointAt(9);
            const result = editor.skip(point, -3, 'word');
            expect(result.viewPos()).toBe(0); // start of "ab"
          });
        });
      });

      describe('line movement – skips over atoms', () => {
        const setupLine = () => {
          const kit = setup();
          const {peritext} = kit;
          const str = peritext.strApi();
          str.del(0, str.length());
          str.ins(0, 'ab X1Y fg\nhi jkl mn');
          // "X1Y" at offset 3, length 3 is the atom (mixed chars)
          const range = peritext.rangeAt(3, 3);
          const atom = peritext.savedSlices.insAtomic(range, 'math', {tex: 'E=mc^2'}, padded);
          peritext.overlay.refresh();
          return {...kit, atom};
        };

        test('eol() result is not inside atom', () => {
          const {peritext, editor} = setupLine();
          const point = peritext.pointAt(0);
          const result = editor.eol(point);
          const pos = result.viewPos();
          expect(pos).toBe(9);
          expect(editor.atomAt(result)).toBeUndefined();
        });

        test('bol() result is not inside atom', () => {
          const {peritext, editor} = setupLine();
          const point = peritext.pointAt(9);
          const result = editor.bol(point);
          const pos = result.viewPos();
          expect(pos).toBe(0);
          expect(editor.atomAt(result)).toBeUndefined();
        });

        test('eol() does not stop at newline-like char inside atom', () => {
          const kit = setup();
          const {peritext, editor} = kit;
          const str = peritext.strApi();
          str.del(0, str.length());
          // Place a newline character inside the atom content
          str.ins(0, 'hello X\nY world');
          // "X\nY" at offset 6, length 3 is the atom
          const range = peritext.rangeAt(6, 3);
          peritext.savedSlices.insAtomic(range, 'formula', undefined, padded);
          peritext.overlay.refresh();
          const point = peritext.pointAt(0);
          const result = editor.eol(point);
          // Should skip past the atom's internal newline and reach end of text
          expect(editor.atomAt(result)).toBeUndefined();
          expect(result.viewPos()).toBeGreaterThanOrEqual(9);
        });
      });
    });
  }
};

runNumbersKitTestSuite(testSuite);
