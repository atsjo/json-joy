import * as React from 'react';
import type {RenderBlockProps} from '../RenderBlock';

export interface MidBlockProps extends RenderBlockProps {}

export const MidBlock: React.FC<MidBlockProps> = ({children}) => {
  return children;
};
