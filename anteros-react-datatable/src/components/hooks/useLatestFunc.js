import { useRef, useEffect, useCallback } from 'react';

// https://reactjs.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often
export function useLatestFunc(fn) {
  const ref = useRef(fn);

  useEffect(() => {
    ref.current = fn;
  });

  return useCallback((...args) => {
    ref.current(...args);
  }, []);
}
