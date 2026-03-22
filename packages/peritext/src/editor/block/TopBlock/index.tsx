import * as React from 'react';
import type {RenderBlockProps} from '../RenderBlock';

export interface TopBlockProps extends RenderBlockProps {}

export const TopBlock: React.FC<TopBlockProps> = ({children}) => {
  return children;
};
