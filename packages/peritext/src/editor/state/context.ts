import * as React from 'react';
import type {EditorState} from './EditorState';

export const context = React.createContext<EditorState>(null!);
export const useEditor = () => React.useContext(context);
