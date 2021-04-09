import { useRef, useLayoutEffect } from 'react';

export function useFocusRef(isCellSelected) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!isCellSelected) return;
    ref.current.focus({ preventScroll: true });
  }, [isCellSelected]);

  return ref;
}
