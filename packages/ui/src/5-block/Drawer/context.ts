import * as React from 'react';
import type {DrawerState} from './state';

export const ctx = React.createContext<DrawerState>(null!);
export const useDrawer = (): DrawerState => React.useContext(ctx);
