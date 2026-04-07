import type {ApiTestSetup} from '../../../__demos__/json-crdt-server/__tests__/setup';
import {runUtilTests} from '../../json-crdt-server/util';
import {runPubsubTests} from '../../json-crdt-server/pubsub';
import {runPresenceTests} from '../../json-crdt-server/presence';
import {runBlockTests} from '../../json-crdt-server/block';
import {cborCodec} from '../codecs';
import {setupDemoServerPersistentClient, setupDemoServerFetchClient} from '../demo-client';

if (process.env.TEST_E2E && process.env.TEST_E2E_DEMO_SERVER) {
  describe('RxPersistentCaller', () => {
    const codec = cborCodec();
    const setup: ApiTestSetup = async () => setupDemoServerPersistentClient(codec);
    describe(`protocol: application/x.${codec.specifier()}`, () => {
      runUtilTests(setup);
      runPubsubTests(setup);
      runPresenceTests(setup);
      runBlockTests(setup);
    });
  });

  describe('FetchCaller', () => {
    const codec = cborCodec();
    const setup: ApiTestSetup = async () => setupDemoServerFetchClient(codec);
    describe(`protocol: application/x.${codec.specifier()}`, () => {
      runUtilTests(setup);
      runPubsubTests(setup, {staticOnly: true});
      runPresenceTests(setup, {staticOnly: true});
      runBlockTests(setup, {staticOnly: true});
    });
  });
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
