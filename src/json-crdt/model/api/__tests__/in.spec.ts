import {ConNode, RootLww, ValNode, ObjNode} from '../../../nodes';
import {ConApi, ObjectApi, ValApi} from '../nodes';
import {Model} from '../../Model';

describe('can use .in() method to reference any model node', () => {
  const doc = Model.withLogicalClock();

  test('can access root node', () => {
    const node = doc.api.r.asVal();
    expect(node.node).toBeInstanceOf(RootLww);
  });

  doc.api.root({
    foo: [1],
  });
  doc.api.r.in('/foo/0').asVal().set({bar: 'baz'});

  test('can access array element ValNode and its contents', () => {
    const register1 = doc.api.r.in().in('foo').in(0).asVal();
    const register2 = doc.api.val('/foo/0');
    const register3 = doc.api.val(['foo', 0]);
    expect(register1).toBeInstanceOf(ValApi);
    expect(register1.node).toBeInstanceOf(ValNode);
    expect(register1.node).toBe(register2.node);
    expect(register1.node).toBe(register3.node);
    const obj1 = register1.in();
    expect(obj1).toBeInstanceOf(ObjectApi);
    expect(obj1.node).toBeInstanceOf(ObjNode);
  });

  doc.api.obj([]).set({val: doc.api.builder.jsonVal(123)});

  test('can access object key ValNode and its contents', () => {
    const register1 = doc.api.r.in().in('val').asVal();
    const register2 = doc.api.val('/val');
    const register3 = doc.api.val(['val']);
    expect(register1).toBeInstanceOf(ValApi);
    expect(register1.node).toBeInstanceOf(ValNode);
    expect(register1.node).toBe(register2.node);
    expect(register1.node).toBe(register3.node);
    const const1 = register1.in();
    expect(const1).toBeInstanceOf(ConApi);
    expect(const1.node).toBeInstanceOf(ConNode);
  });
});
