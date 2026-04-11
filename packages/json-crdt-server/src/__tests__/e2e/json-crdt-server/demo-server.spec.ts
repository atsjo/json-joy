import {runBlockTests} from '../../server/block';
import {runPresenceTests} from '../../server/presence';
import {runPubsubTests} from '../../server/pubsub';
import {runUtilTests} from '../../server/util';
import type {ApiTestSetup} from '../../types';
import {cborCodec} from '../codecs';
import {
  setupDemoServerPersistentClient,
  setupDemoServerFetchClient,
} from '../demo-client';

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
      runBlockTests(setup, {staticOnly: true});
    });
  });
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
