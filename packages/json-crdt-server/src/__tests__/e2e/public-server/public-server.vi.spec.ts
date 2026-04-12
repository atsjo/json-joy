import {runBlockTests} from '../../server/block';
import {runPresenceTests} from '../../server/presence';
import {runPubsubTests} from '../../server/pubsub';
import {runUtilTests} from '../../server/util';
import {cborCodec, jsonCodec} from '../codecs';
import {setupWsClient, setupHttpClient} from './client';
import type {ApiTestSetup} from '../../types';

if (process.env.TEST_PUBLIC_SERVER) {
  describe('RxPersistentCaller', () => {
    const codec = cborCodec();
    const setup: ApiTestSetup = async () => setupWsClient(codec);
    describe(`protocol: application/x.${codec.specifier()}`, () => {
      runUtilTests(setup);
      runPubsubTests(setup);
      runPresenceTests(setup);
      runBlockTests(setup);
    });
  });

  describe('FetchCaller', () => {
    const codec = jsonCodec();
    const setup: ApiTestSetup = async () => setupHttpClient(codec);
    describe(`protocol: application/x.${codec.specifier()}`, () => {
      runUtilTests(setup);
      runPubsubTests(setup, {staticOnly: true});
      runBlockTests(setup, {staticOnly: true});
    });
  });
} else {
  test.skip('set TEST_PUBLIC_SERVER=1 env var to run this test suite', () => {});
}
