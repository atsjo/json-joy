import * as React from 'react';
import type {ScrollState} from './state';

export const ctx = React.createContext<ScrollState>(null!);
export const useScrollArea = (): ScrollState => React.useContext(ctx);
