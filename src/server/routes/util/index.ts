import type {RoutesBase, TypeRouter} from '../../../json-type/system/TypeRouter';
import type {MyCtx} from '../../services/types';
import type {RouteDeps} from '../types';

export const ping =
  (deps: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;
    const req = t.any;
    const res = t.Const(<const>'pong');
    const func = t.Function(req, res).implement<MyCtx>(async () => {
      return 'pong';
    });
    return router.route('util.ping', func);
  };

export const echo =
  (deps: RouteDeps) =>
  <R extends RoutesBase>(router: TypeRouter<R>) => {
    const t = router.t;
    const req = t.any;
    const res = t.any;
    const func = t.Function(req, res).implement<MyCtx>(async (msg) => msg);
    return router.route('util.echo', func);
  };

// prettier-ignore
export const util = (deps: RouteDeps) => <R extends RoutesBase>(r: TypeRouter<R>) =>
  ( ping(deps)
  ( echo(deps)
  ( r )));
