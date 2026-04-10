import {LogicalClock} from '../../../../clock';
import {PatchBuilder} from '../../../../PatchBuilder';
import {documents} from '../../../../../__tests__/json-documents';
import {binaryDocuments} from '../../../../../__tests__/binary-documents';
import {assertRoundtrip} from './assertRoundtrip';
import {Patch} from '../../../../Patch';
import {Batch} from '../../../Batch';

for (const document of [...documents, ...binaryDocuments]) {
  (document.only ? test.only : test)(document.name, () => {
    const clock = new LogicalClock(3, 100);
    const builder = new PatchBuilder(clock);
    const jsonId = builder.json(document.json);
    builder.root(jsonId);
    assertRoundtrip(void 0, builder.patch);
  });
}


test('all docs in one batch', () => {
  const patches: Patch[] = [];
  for (const document of [...documents, ...binaryDocuments]) {
    const clock = new LogicalClock(3, 100);
    const builder = new PatchBuilder(clock);
    const jsonId = builder.json(document.json);
    builder.root(jsonId);
    patches.push(builder.patch);
  }
  const batch = new Batch(patches);
  // console.log(batch + '');
  assertRoundtrip(void 0, void 0, batch);
});
