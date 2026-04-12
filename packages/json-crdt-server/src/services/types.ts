import type {ConnectionContext} from '@jsonjoy.com/rpc-server/lib/types';
import type {Services} from './Services';

export type MyCtx = ConnectionContext<{services: Services}>;
