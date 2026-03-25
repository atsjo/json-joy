import * as React from 'react';
import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect';
import {useEditor} from '../state';
import {useSyncStore} from '../../web/react/hooks';
import type {RenderDocProps} from './RenderDoc';

export const Doc: React.FC<RenderDocProps> = ({children}) => {
  const state = useEditor();
  const sizer = state.docSizer;
  const ref = React.useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    const div = ref.current;
    if (!div) return;
    sizer.observe(div);
    return () => {
      sizer.unobserve(div);
    };
  }, [sizer, ref.current]);
  const _width = useSyncStore(state.docWidth);

  return <div ref={ref}>{children}</div>;
};
