import { useEffect, useState } from 'react';

import { canUseDOM, managedEventListener } from './util';

/**
 * Tracks window size.
 *
 * @returns Dimensions `[width, height]`, falling back to `[0, 0]` when unavailable.
 *
 * @example
 * function Component() {
 *   const [windowWidth, windowHeight] = useWindowSize();
 *   // ...
 * }
 */
export default function useWindowSize() {
  const [size, setSize] = useState(
    canUseDOM ? [window.innerWidth, window.innerHeight] : [0, 0],
  );

  useEffect(
    () =>
      managedEventListener(window, 'resize', () => {
        setSize([window.innerWidth, window.innerHeight]);
      }),
    [],
  );

  return size;
}
