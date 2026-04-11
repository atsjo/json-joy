import type {ConnectionContext} from '@jsonjoy.com/reactive-rpc/lib/server/context';
import type {Services} from './Services';

export type MyCtx = ConnectionContext<{services: Services}>;
