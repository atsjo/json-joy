import {map, switchMap} from 'rxjs';
import {BlockEventRef, BlockIdRef} from '../schema';
import type {RouteDeps, Router, RouterBase} from '../../types';

export const listen =
  ({t, services}: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    const Request = t.Object(
      t.Key('id', BlockIdRef).options({
        title: 'Block ID',
        description: 'The ID of the block to subscribe to.',
      }),
      t.KeyOpt('clientId', t.Number({format: 'u32'})).options({
        title: 'Client ID',
        description:
          'Browser (client) ID, a unique ID of a specific browser instance. When provided events originating by this client will be filtered out. The client ID is a 32-bit unsigned integer, which should be randomly generated on the client and re-used for all API calls.',
      }),
    );

    const Response = t.Object(t.Key('event', BlockEventRef));

    const Func = t.Function$(Request, Response).options({
      title: 'Listen for block changes',
      description: 'Subscribe to a block to receive updates when it changes.',
    });

    return r.add('block.listen', Func, (req$) => {
      const response = req$.pipe(
        switchMap(({id, clientId = 0}) => {
          return services.blocks.listen(id, clientId);
        }),
        map((event) => {
          return {
            event,
          };
        }),
      );
      return response;
    });
  };
