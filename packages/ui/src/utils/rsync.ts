import {useSyncExternalStore} from 'react';
import {Value, Computed, type WrapListInSyncDep} from 'thingies/lib/sync';

export class ReactValue<T> extends Value<T> {
  public use(): T {
    return useSyncExternalStore(this.subscribe, this.getSnapshot);
  }
}

export const val = <T>(value: T) => new ReactValue(value);

export class ReactComputed<N, V extends unknown[] = any> extends Computed<N, V> {
  public use(): N {
    return useSyncExternalStore(this.subscribe, this.getSnapshot);
  }
}

export const comp = <N, V extends unknown[] = any>(deps: WrapListInSyncDep<V>, compute: (args: V) => N) =>
  new ReactComputed(deps, compute);
