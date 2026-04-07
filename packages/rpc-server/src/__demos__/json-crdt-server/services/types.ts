import type {ConnectionContext} from '../../../types';
import type {Services} from './Services';

export type MyCtx = ConnectionContext<{services: Services}>;
