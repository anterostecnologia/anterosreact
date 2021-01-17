import { useEffect, useState } from 'react';

import { canUseDOM, managedEventListener } from './util';

/**
 * Tracks window scroll position.
 *
 * @returns Coordinates `[x, y]`, falling back to `[0, 0]` when unavailable.
 *
 * @example
 * function Component() {
 *   const [windowScrollX, windowScrollY] = useWindowScrollCoords();
 *   // ...
 * }
 */
export default function useWindowScrollCoords() {
  const [coords, setCoords] = useState(
    canUseDOM ? [window.pageXOffset, window.pageYOffset] : [0, 0],
  );

  useEffect(
    () =>
      managedEventListener(window, 'scroll', () => {
        setCoords([window.pageXOffset, window.pageYOffset]);
      }),
    [],
  );

  return coords;
}
