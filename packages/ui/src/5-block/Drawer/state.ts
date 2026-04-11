import * as rsync from '../../utils/rsync';
import type {DrawerSide} from './types';

export class DrawerState {
  public readonly open$ = rsync.val<boolean>(false);
  public readonly side$: rsync.ReactValue<DrawerSide>;
  public readonly width$: rsync.ReactValue<number>;

  constructor(opts?: {open?: boolean; side?: DrawerSide; width?: number}) {
    if (opts?.open) this.open$.next(true);
    this.side$ = rsync.val<DrawerSide>(opts?.side ?? 'left');
    this.width$ = rsync.val<number>(opts?.width ?? 260);
  }

  public readonly toggle = () => {
    this.open$.next(!this.open$.value);
  };
}
