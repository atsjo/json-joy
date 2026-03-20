import {FanOut} from 'thingies/lib/fanout';

export interface SyncStore<T> {
  subscribe: SyncStoreSubscribe;
  getSnapshot: () => T;
}
export type SyncStoreSubscribe = (callback: () => void) => SyncStoreUnsubscribe;
export type SyncStoreUnsubscribe = () => void;
export type WrapListInValueSyncStore<T extends unknown[]> = {
  [K in keyof T]: ValueSyncStore<T[K]>;
};
export interface Disposable {
  dispose(): void;
}

export class ValueSyncStore<V> extends FanOut<void> implements SyncStore<V> {  
  constructor(public value: V) {
    super();
  } 
  public next(value: V, force = false): void {
    if (!force && this.value === value) return;
    this.value = value;
    this.emit();
  }
  public readonly subscribe: SyncStoreSubscribe = (cb) => this.listen(cb);
  public readonly getSnapshot: () => V = () => this.value;
}

export class Computed<N, V extends unknown[] = any> extends FanOut<void> implements SyncStore<N>, Disposable {
  private cached: N | undefined = void 0;
  private subs: SyncStoreUnsubscribe[];

  constructor(
    protected readonly deps: WrapListInValueSyncStore<V>,
    protected readonly compute: (args: V) => N
  ) {
    super();
    const subs = this.subs = [] as SyncStoreUnsubscribe[];
    const length = deps.length;
    for (let i = 0; i < length; i++) {
      const dep = deps[i];
      const sub = dep.listen(() => {
        this.cached = void 0;
        this.emit();
      });
      subs.push(sub);
    }
  }

  public dispose() {
    for (const sub of this.subs) sub();
  }

  private _comp(): N {
    let cached = this.cached;
    if (cached !== undefined) return cached;
    return this.cached = this.compute(this.deps.map((dep) => dep.getSnapshot()) as V);
  }

  public get value(): N {
    return this._comp();
  }

  public readonly subscribe: SyncStoreSubscribe = (cb) => this.listen(cb);
  public readonly getSnapshot: () => N = () => this._comp();
}

export const val = <V>(initial: V): ValueSyncStore<V> => new ValueSyncStore(initial);

export const comp = <V extends unknown[], N>(
  deps: WrapListInValueSyncStore<V>,
  compute: (args: V) => N,
): Computed<N, V> => new Computed(deps, compute);
