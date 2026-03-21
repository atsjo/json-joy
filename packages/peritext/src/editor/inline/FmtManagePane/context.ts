import * as React from 'react';
import type {FmtManagePaneState} from './state';

export const context = React.createContext<FmtManagePaneState>(null!);
export const useFormattingPane = () => React.useContext(context);
