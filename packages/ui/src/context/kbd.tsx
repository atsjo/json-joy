import * as React from 'react';
import {KeyContext, type AnyBinding} from '@jsonjoy.com/keyboard';

export const ctx = React.createContext<KeyContext | null>(null);

export const useKbd = (): KeyContext => {
  const kbd0 = React.useContext(ctx);
  const disposeRef = React.useRef<(() => void) | undefined>(void 0);
  const kbd1 = React.useMemo(() => {
    if (kbd0) return kbd0;
    const [kbd, dispose] = KeyContext.global();
    disposeRef.current = dispose;
    return kbd;
  }, [kbd0]);
  React.useEffect(() => {
    return () => {
      disposeRef.current?.();
    };
  }, [kbd1]);
  return kbd1;
};

export interface KbdProps {
  child?: string;
  bind?: AnyBinding[];
  children?: React.ReactNode;
}

export const Kbd: React.FC<KbdProps> = ({child, bind, children}) => {
  const kbd0 = useKbd();
  const kbd1 = React.useMemo(() => {
    return child ? kbd0.child(child) : kbd0;
  }, [kbd0, child]);
  React.useEffect(() => {
    return () => {
      if (kbd0 !== kbd1) kbd1.dispose();
    };
  }, [kbd1]);
  React.useEffect(() => {
    if (!bind) return;
    const unbind = kbd1.bind(bind);
    return () => {
      unbind();
    };
  }, []);

  return <ctx.Provider value={kbd1}>{children}</ctx.Provider>;
};
