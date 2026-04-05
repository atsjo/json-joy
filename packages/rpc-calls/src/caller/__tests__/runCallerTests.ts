import * as Rx from 'rxjs';
import {firstValueFrom, lastValueFrom} from 'rxjs';
import {of} from 'thingies/lib/of';
import type {ProceduresToCallerMethods, Caller} from '../types';
import type {procedures} from '../../callee/__tests__/Callee.fixtures';
import type {RpcError} from 'rpc-error';

export interface ApiTestSetupResult {
  caller: Caller<ProceduresToCallerMethods<typeof procedures>>;
  stop: () => Promise<void>;
}

export type ApiTestSetup = () => ApiTestSetupResult | Promise<ApiTestSetupResult>;

export const runCallerTests = (
  setup: ApiTestSetup,
  {skipValidationTests, skipStreamingTests}: {skipValidationTests?: boolean; skipStreamingTests?: boolean} = {},
) => {
  describe('API', () => {
    describe('ping', () => {
      test('can execute static RPC method', async () => {
        const {caller, stop} = await setup();
        const result = await firstValueFrom(caller.call$('ping', {} as any));
        expect(result).toBe('pong');
        await stop();
      }, 15_000);

      test('can execute without payload', async () => {
        const {caller, stop} = await setup();
        const result = await firstValueFrom(caller.call$('ping', undefined));
        expect(result).toBe('pong');
        await stop();
      });

      test('can execute with unexpected payload', async () => {
        const {caller, stop} = await setup();
        const result = await firstValueFrom(caller.call$('ping', 'VERY_UNEXPECTED' as any));
        expect(result).toBe('pong');
        await stop();
      });
    });

    describe('double', () => {
      test('can execute simple "double" method', async () => {
        const {caller, stop} = await setup();
        const result = await firstValueFrom(caller.call$('double', {num: 1.2}));
        expect(result).toEqual({num: 2.4});
        await stop();
      });

      test('can execute two request in parallel', async () => {
        const {caller, stop} = await setup();
        const promise1 = of(firstValueFrom(caller.call$('double', {num: 1})));
        const promise2 = of(firstValueFrom(caller.call$('double', {num: 2})));
        const [res1, res2] = await Promise.all([promise1, promise2]);
        expect(res1[0]).toEqual({num: 2});
        expect(res2[0]).toEqual({num: 4});
        await stop();
      });

      if (!skipValidationTests) {
        test('throws error when validation fails', async () => {
          const {caller, stop} = await setup();
          const [, error] = await of(firstValueFrom(caller.call$('double', {num: {} as any})));
          expect((error as RpcError).code).toBe('BAD_REQUEST');
          expect((error as RpcError).message).toBe('Payload .num field missing.');
          await stop();
        });
      }
    });

    describe('error', () => {
      test('throws error on static RPC error', async () => {
        const {caller, stop} = await setup();
        const [, error] = await of(firstValueFrom(caller.call$('error', {})));
        expect(error).toMatchObject({message: 'this promise can throw'});
        await stop();
      });
    });

    if (!skipStreamingTests) {
      describe('streamError', () => {
        test('throws error on streaming RPC error', async () => {
          const {caller, stop} = await setup();
          const [, error] = await of(lastValueFrom(caller.call$('streamError', {})));
          expect(error).toMatchObject({message: 'Stream always errors'});
          await stop();
        });
      });
    }

    if (!skipStreamingTests) {
      describe('util.info', () => {
        test('can receive one value of stream that ends after emitting one value', async () => {
          const {caller, stop} = await setup();
          const observable = caller.call$('util.info', {});
          const result = await firstValueFrom(observable);
          expect(result).toEqual({
            commit: 'AAAAAAAAAAAAAAAAAAA',
            sha1: 'BBBBBBBBBBBBBBBBBBB',
          });
          await stop();
        });
      });
    }

    describe('doubleStringWithValidation', () => {
      test('can execute successfully', async () => {
        const {caller, stop} = await setup();
        const result = await firstValueFrom(caller.call$('doubleStringWithValidation', {foo: 'a'}));
        expect(result).toEqual({
          bar: 'aa',
        });
        await stop();
      });

      if (!skipValidationTests) {
        test('throws on invalid data', async () => {
          const {caller, stop} = await setup();
          const [, error] = await of(firstValueFrom(caller.call$('doubleStringWithValidation', {foo: 123 as any})));
          expect(error).toMatchObject({
            message: '"foo" property missing.',
          });
          await stop();
        });
      }
    });

    // We loop here to check for memory leaks.
    if (!skipStreamingTests) {
      for (let i = 0; i < 5; i++) {
        describe(`doubleStringWithValidation2, iteration ${i + 1}`, () => {
          test('can execute successfully', async () => {
            const {caller, stop} = await setup();
            const result = await firstValueFrom(caller.call$('doubleStringWithValidation2', {foo: 'a'}));
            await new Promise((r) => setTimeout(r, 15));
            expect(result).toEqual({
              bar: 'aa',
            });
            await stop();
          });

          if (!skipValidationTests) {
            test('throws on invalid data', async () => {
              const {caller, stop} = await setup();
              const [, error] = await of(
                firstValueFrom(caller.call$('doubleStringWithValidation2', {foo: 123 as any})),
              );
              expect(error).toMatchObject({
                message: '"foo" property missing.',
              });
              await stop();
            });
          }
        });
      }
    }
  });

  describe('Caller interface', () => {
    test('can execute various methods in parallel', async () => {
      const {caller, stop} = await setup();
      const repeat = async () => {
        const promises: Promise<any>[] = [
          caller.call('ping', undefined),
          caller.call('double', {num: 5}),
          caller.call('auth.users.get', {id: 'user-123'}),
          Rx.firstValueFrom(caller.call$('auth.users.get', {id: 'xxx'})),
          Rx.firstValueFrom(caller.call$('doubleStringWithValidation', {foo: '123'})),
        ];
        if (!skipStreamingTests) {
          promises.push(
            Rx.firstValueFrom(caller.call$('util.info', void 0)),
            Rx.firstValueFrom(caller.call$('count', {count: 1})),
          );
        }
        const results = await Promise.all(promises);
        expect(results[0]).toBe('pong');
        expect(results[1].num).toBe(10);
        expect(results[2]).toEqual({
          id: 'user-123',
          name: 'Mario Dragi',
          tags: ['news', 'cola', 'bcaa'],
        });
        expect(results[3].id).toEqual('xxx');
        expect(results[4]).toEqual({
          bar: '123123',
        });
        if (!skipStreamingTests) {
          expect(results[5]).toEqual({
            commit: 'AAAAAAAAAAAAAAAAAAA',
            sha1: 'BBBBBBBBBBBBBBBBBBB',
          });
          expect(results[6]).toEqual(0);
        }
      };
      await repeat();
      await repeat();
      await repeat();
      await Promise.all([repeat(), repeat(), repeat(), repeat(), repeat()]);
      await stop();
    });

    describe('.call()', () => {
      test('can execute "ping"', async () => {
        const {caller: client, stop} = await setup();
        const res = await client.call('ping', undefined);
        expect(res).toBe('pong');
        await stop();
      });

      test('can execute "double"', async () => {
        const {caller: client, stop} = await setup();
        const res = (await client.call('double', {num: 5})) as any;
        expect(res.num).toBe(10);
        await stop();
      });

      test('can retrieve a context', async () => {
        const {caller, stop} = await setup();
        const res = await caller.call('getIp', void 0);
        expect(res.ip).toBe('127.0.0.1');
        await stop();
      });
    });

    describe('.notify()', () => {
      test('can execute a notification to set a value', async () => {
        const {caller, stop} = await setup();
        await caller.notify('notificationSetValue', {value: 123});
        const val1 = await caller.call('getValue', undefined);
        expect((val1 as any).value).toBe(123);
        await caller.notify('notificationSetValue', {value: 456});
        const val2 = await caller.call('getValue', undefined);
        expect((val2 as any).value).toBe(456);
        await stop();
      });
    });

    describe('.call$()', () => {
      test('can execute "ping"', async () => {
        const {caller, stop} = await setup();
        const res = await Rx.firstValueFrom(caller.call$('ping', Rx.of(undefined)));
        expect(res).toBe('pong');
        await stop();
      });

      test('can execute "double"', async () => {
        const {caller, stop} = await setup();
        const res = (await Rx.firstValueFrom(caller.call$('double', Rx.of({num: 5})))) as any;
        expect(res.num).toBe(10);
        await stop();
      });

      if (!skipStreamingTests) {
        test('can execute "timer"', async () => {
          const {caller, stop} = await setup();
          const res = await Rx.firstValueFrom(caller.call$('util.timer', Rx.of(undefined)).pipe(Rx.skip(2)));
          expect(res).toBe(2);
          await stop();
        });
      }

      test('can retrieve a context', async () => {
        const {caller, stop} = await setup();
        const res = await Rx.firstValueFrom(caller.call$('getIp', Rx.of(void 0)));
        expect(res.ip).toBe('127.0.0.1');
        await stop();
      });
    });
  });
};
