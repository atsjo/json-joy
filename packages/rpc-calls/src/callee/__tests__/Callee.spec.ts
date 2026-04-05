import * as Rx from 'rxjs';
import {createRpcCallee} from './Callee.fixtures';
import {RpcCallee} from '../RpcCallee';
import {Procedure} from '../../procedures';
import {of} from 'thingies';
import {RpcError} from 'rpc-error';

const setup = () => {
  const callee = createRpcCallee();
  return {callee};
};

describe('.call()', () => {
  test('can execute "ping"', async () => {
    const {callee} = setup();
    const res = await callee.call('ping', undefined, void 0);
    expect(res).toBe('pong');
  });

  test('can execute "double"', async () => {
    const {callee} = setup();
    const res = (await callee.call('double', {num: 5}, void 0)) as any;
    expect(res.num).toBe(10);
  });

  test('wraps error into RpcError', async () => {
    const callee = new RpcCallee<any>({
      procedures: {
        test: Procedure.unary(async () => {
          // tslint:disable-next-line:no-string-throw
          throw 'lol';
        }),
      },
    });
    const [, error] = await of(callee.call('test', {}, {}));
    expect(error).toEqual(RpcError.internal('lol'));
  });

  test('can specify a context', async () => {
    const {callee} = setup();
    const res = await callee.call('getIp', void 0, {ip: '1.2.3.4'});
    expect(res.ip).toBe('1.2.3.4');
  });
});

describe('.notify()', () => {
  test('can execute a notification to set a value', async () => {
    const {callee} = setup();
    await callee.notify('notificationSetValue', {value: 123}, {});
    const val1 = await callee.call('getValue', undefined, {});
    expect((val1 as any).value).toBe(123);
    await callee.notify('notificationSetValue', {value: 456}, {});
    const val2 = await callee.call('getValue', undefined, {});
    expect((val2 as any).value).toBe(456);
  });

  test('can specify a context', async () => {
    const {callee} = setup();
    await callee.call('notificationSetValueFromCtx', void 0, {ip: '1.2.3.4'});
    const len = await callee.call('getValue', undefined, {});
    expect(len.value).toBe('1.2.3.4'.length);
  });
});

describe('.call$()', () => {
  test('can execute "ping"', async () => {
    const {callee} = setup();
    const res = await Rx.firstValueFrom(callee.call$('ping', Rx.of(undefined), {}));
    expect(res).toBe('pong');
  });

  test('can execute "double"', async () => {
    const {callee} = setup();
    const res = (await Rx.firstValueFrom(callee.call$('double', Rx.of({num: 5}), {}))) as any;
    expect(res.num).toBe(10);
  });

  test('can execute "timer"', async () => {
    const {callee} = setup();
    const res = await Rx.firstValueFrom(callee.call$('util.timer', Rx.of(undefined), {}).pipe(Rx.skip(2)));
    expect(res).toBe(2);
  });

  test('wraps errors into internal RpcError values', async () => {
    const callee = new RpcCallee({
      procedures: {
        test: Procedure.rx(() => {
          const subject = new Rx.Subject();
          subject.error('lol');
          return subject;
        }),
      },
    });
    const [, error1] = await of(callee.call('test', {}, {}));
    expect(error1).toEqual(RpcError.internal('lol'));
    const [, error2] = await of(Rx.firstValueFrom(callee.call$('test', Rx.of(void 0), {})));
    expect(error2).toEqual(RpcError.internal('lol'));
  });

  test('can specify a context', async () => {
    const {callee} = setup();
    const res = await Rx.firstValueFrom(callee.call$('getIp', Rx.of(void 0), {ip: '1.1.1.1'}));
    expect(res.ip).toBe('1.1.1.1');
  });
});
