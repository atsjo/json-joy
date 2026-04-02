import {
  NotificationMessage,
  RequestCompleteMessage,
  RequestDataMessage,
  RequestErrorMessage,
  RequestUnsubscribeMessage,
  ResponseCompleteMessage,
  ResponseDataMessage,
  ResponseErrorMessage,
  ResponseUnsubscribeMessage,
} from '../messages';
import {unknown} from '../unknown';

const val = (data: unknown = undefined) => unknown(data);

describe('NotificationMessage', () => {
  test('constructs with method only', () => {
    const msg = new NotificationMessage('ping');
    expect(msg.method).toBe('ping');
    expect(msg.value).toBeUndefined();
  });

  test('constructs with method and value', () => {
    const msg = new NotificationMessage('event', val({x: 1}));
    expect(msg.method).toBe('event');
    expect(msg.value?.data).toEqual({x: 1});
  });

  test('toCompact() without value', () => {
    const msg = new NotificationMessage('ping');
    expect(msg.toCompact()).toEqual([8, 'ping']);
  });

  test('toCompact() with value', () => {
    const msg = new NotificationMessage('event', val(42));
    expect(msg.toCompact()).toEqual([8, 'event', 42]);
  });

  test('validate() passes for valid method', () => {
    expect(() => new NotificationMessage('valid.method').validate()).not.toThrow();
  });

  test('validate() throws for empty method', () => {
    expect(() => new NotificationMessage('').validate()).toThrow(Error);
  });

  test('validate() throws for method that is too long', () => {
    expect(() => new NotificationMessage('a'.repeat(65)).validate()).toThrow(Error);
  });
});

describe('RequestDataMessage', () => {
  test('constructs correctly', () => {
    const msg = new RequestDataMessage(1, 'method', val('hello'));
    expect(msg.id).toBe(1);
    expect(msg.method).toBe('method');
    expect(msg.value?.data).toBe('hello');
  });

  test('toCompact() without value', () => {
    const msg = new RequestDataMessage(3, 'foo', undefined);
    expect(msg.toCompact()).toEqual([0, 3, 'foo']);
  });

  test('toCompact() with value', () => {
    const msg = new RequestDataMessage(3, 'foo', val(99));
    expect(msg.toCompact()).toEqual([0, 3, 'foo', 99]);
  });

  test('validate() passes for valid id and method', () => {
    expect(() => new RequestDataMessage(1, 'foo', undefined).validate()).not.toThrow();
  });

  test('validate() throws for negative id', () => {
    expect(() => new RequestDataMessage(-1, 'foo', undefined).validate()).toThrow(Error);
  });

  test('validate() throws for id out of range', () => {
    expect(() => new RequestDataMessage(0xffff, 'foo', undefined).validate()).toThrow(Error);
  });
});

describe('RequestCompleteMessage', () => {
  test('toCompact() without value (empty method)', () => {
    const msg = new RequestCompleteMessage(1, '', undefined);
    expect(msg.toCompact()).toEqual([1, 1, '']);
  });

  test('toCompact() with value', () => {
    const msg = new RequestCompleteMessage(2, 'sub', val({done: true}));
    expect(msg.toCompact()).toEqual([1, 2, 'sub', {done: true}]);
  });

  test('validate() passes', () => {
    expect(() => new RequestCompleteMessage(0, 'a', undefined).validate()).not.toThrow();
  });
});

describe('RequestErrorMessage', () => {
  test('toCompact()', () => {
    const msg = new RequestErrorMessage(5, 'op', val({err: 'oops'}));
    expect(msg.toCompact()).toEqual([2, 5, 'op', {err: 'oops'}]);
  });

  test('validate() passes', () => {
    expect(() => new RequestErrorMessage(1, 'op', val(null)).validate()).not.toThrow();
  });
});

describe('RequestUnsubscribeMessage', () => {
  test('toCompact()', () => {
    const msg = new RequestUnsubscribeMessage(7);
    expect(msg.toCompact()).toEqual([3, 7]);
  });

  test('validate() passes', () => {
    expect(() => new RequestUnsubscribeMessage(0).validate()).not.toThrow();
  });

  test('validate() throws for invalid id', () => {
    expect(() => new RequestUnsubscribeMessage(-1).validate()).toThrow(Error);
  });
});

describe('ResponseDataMessage', () => {
  test('toCompact()', () => {
    const msg = new ResponseDataMessage(4, val('chunk'));
    expect(msg.toCompact()).toEqual([4, 4, 'chunk']);
  });

  test('validate() passes', () => {
    expect(() => new ResponseDataMessage(1, val(null)).validate()).not.toThrow();
  });
});

describe('ResponseCompleteMessage', () => {
  test('toCompact() without value', () => {
    const msg = new ResponseCompleteMessage(2);
    expect(msg.toCompact()).toEqual([5, 2]);
  });

  test('toCompact() with value', () => {
    const msg = new ResponseCompleteMessage(2, val({result: true}));
    expect(msg.toCompact()).toEqual([5, 2, {result: true}]);
  });

  test('validate() passes', () => {
    expect(() => new ResponseCompleteMessage(0).validate()).not.toThrow();
  });
});

describe('ResponseErrorMessage', () => {
  test('toCompact()', () => {
    const msg = new ResponseErrorMessage(3, val({code: 'ERR'}));
    expect(msg.toCompact()).toEqual([6, 3, {code: 'ERR'}]);
  });

  test('validate() passes', () => {
    expect(() => new ResponseErrorMessage(1, val(null)).validate()).not.toThrow();
  });
});

describe('ResponseUnsubscribeMessage', () => {
  test('toCompact()', () => {
    const msg = new ResponseUnsubscribeMessage(9);
    expect(msg.toCompact()).toEqual([7, 9]);
  });

  test('validate() passes', () => {
    expect(() => new ResponseUnsubscribeMessage(1).validate()).not.toThrow();
  });

  test('validate() throws for invalid id', () => {
    expect(() => new ResponseUnsubscribeMessage(0xffff).validate()).toThrow(Error);
  });
});

describe('validation helpers', () => {
  test('validateMethod rejects method with invalid characters', () => {
    expect(() => new NotificationMessage('invalid method!').validate()).toThrow(Error);
  });

  test('validateMethod accepts method with dots, dashes, colons, underscores', () => {
    expect(() => new NotificationMessage('user.get-by_id:v1').validate()).not.toThrow();
  });
});
