import {RpcError} from '..';

describe('specific factories', () => {
  test('can create BAD_REQUEST error', () => {
    const err = RpcError.badRequest();
    expect(err).toMatchObject({
      message: 'Bad Request',
      code: 'BAD_REQUEST',
      errno: 1,
      meta: undefined,
      originalError: undefined,
    });
    expect(err.toJson()).toMatchObject({
      message: 'Bad Request',
      code: 'BAD_REQUEST',
      errno: 1,
    });
  });

  test('can create CONFLICT error with custom message', () => {
    const err = RpcError.conflict('Test');
    expect(err).toMatchObject({
      message: 'Test',
      code: 'CONFLICT',
      errno: 4,
      meta: undefined,
      originalError: undefined,
    });
    expect(err.toJson()).toMatchObject({
      message: 'Test',
      code: 'CONFLICT',
      errno: 4,
    });
  });
});

describe('.fromCode()', () => {
  test('can create an error', () => {
    const err = RpcError.fromCode('DISCONNECT');
    expect(err).toMatchObject({
      message: 'DISCONNECT',
      code: 'DISCONNECT',
      meta: undefined,
      originalError: undefined,
    });
    expect(err.toJson()).toMatchObject({
      message: 'DISCONNECT',
      code: 'DISCONNECT',
    });
  });
});

describe('.create()', () => {
  test('can create an error with a custom code', () => {
    const err = RpcError.create('CUSTOM_ERROR');
    expect(err).toMatchObject({
      message: 'CUSTOM_ERROR',
      code: 'CUSTOM_ERROR',
      meta: undefined,
      originalError: undefined,
    });
    expect(err.toJson()).toMatchObject({
      message: 'CUSTOM_ERROR',
      code: 'CUSTOM_ERROR',
    });
  });
});

describe('.isRpcError()', () => {
  test('returns true for RpcError', () => {
    const err = RpcError.fromCode('DISCONNECT');
    expect(RpcError.isRpcError(err)).toBe(true);
  });

  test('returns false for non-RpcError', () => {
    expect(RpcError.isRpcError(null)).toBe(false);
    expect(RpcError.isRpcError(new Error('adsf'))).toBe(false);
  });
});

describe('.from()', () => {
  test('wraps regular error into RpcError', () => {
    const err = new Error('test');
    const error = RpcError.from(err);
    expect(RpcError.isRpcError(err)).toBe(false);
    expect(RpcError.isRpcError(error)).toBe(true);
  });
});
