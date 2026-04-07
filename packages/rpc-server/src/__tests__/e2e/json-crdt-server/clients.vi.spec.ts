import type {ApiTestSetup} from '../../../__demos__/json-crdt-server/__tests__/setup';
import {runUtilTests} from '../../json-crdt-server/util';
import {runPubsubTests} from '../../json-crdt-server/pubsub';
import {runPresenceTests} from '../../json-crdt-server/presence';
import {runBlockTests} from '../../json-crdt-server/block';
import {setupCodecs, setupSymmetricCodecs} from '../codecs';
import {setupRpcPersistentClient, setupFetchRpcClient} from '../clients';

if (process.env.TEST_E2E) {
  describe('RxPersistentCaller', () => {
    const {list} = setupSymmetricCodecs({skipJson2: true});
    for (const codec of list) {
      const setup: ApiTestSetup = async () => setupRpcPersistentClient(codec);
      describe(`protocol: application/x.${codec.specifier()}`, () => {
        runUtilTests(setup);
        runPubsubTests(setup);
        runPresenceTests(setup);
        runBlockTests(setup);
      });
    }
  });

  describe('FetchCaller', () => {
    const {list} = setupCodecs();
    for (const codec of list) {
      const setup: ApiTestSetup = async () => setupFetchRpcClient(codec);
      describe(`protocol: application/x.${codec.specifier()}`, () => {
        runUtilTests(setup);
        runPubsubTests(setup, {staticOnly: true});
        runBlockTests(setup, {staticOnly: true});
      });
      break;
    }
  });
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
