import {useEffect, useRef} from 'react';
import type {RefObject} from 'react';

export const useFocusTrap = (ref: RefObject<HTMLElement | null>, active: boolean) => {
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    triggerRef.current = document.activeElement;
    const el = ref.current;

    const siblings = Array.from(document.body.children).filter((ch) => ch !== el && !ch.contains(el));
    siblings.forEach((s) => ((s as HTMLElement).inert = true));

    const firstFocusable = el.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (firstFocusable) firstFocusable.focus();
    else el.focus();

    return () => {
      siblings.forEach((s) => ((s as HTMLElement).inert = false));
      (triggerRef.current as HTMLElement | null)?.focus();
    };
  }, [active, ref]);
};
