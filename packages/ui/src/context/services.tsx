import * as React from 'react';
import type {NiceUiServices} from './services/NiceUiServices';

export const context = React.createContext<NiceUiServices>(null!);

export const useUiServices = () => React.useContext(context);
