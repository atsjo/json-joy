import {type ApiTestSetup, runCallerTests} from '../../../../../rpc-calls/src/caller/__tests__/runCallerTests';
import {setupCodecs, setupSymmetricCodecs} from '../codecs';
import {setupRpcPersistentClient, setupFetchRpcClient} from '../clients';

if (process.env.TEST_E2E) {
  describe('RxPersistentCaller', () => {
    const {list} = setupSymmetricCodecs();
    for (const codec of list) {
      const setup: ApiTestSetup = async () => setupRpcPersistentClient(codec);
      const isJson2 = codec.specifier().includes('json2');
      describe(`protocol: application/x.${codec.specifier()}`, () => {
        runCallerTests(setup, {skipStreamingTests: isJson2});
      });
    }
  });

  describe('FetchCaller', () => {
    const {list} = setupCodecs();
    for (const codec of list) {
      const setup: ApiTestSetup = async () => setupFetchRpcClient(codec);
      describe(`protocol: application/x.${codec.specifier()}`, () => {
        runCallerTests(setup, {skipStreamingTests: true});
      });
    }
  });
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
