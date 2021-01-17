import { useEffect, useState } from 'react';

import { canUseDOM, managedEventListener } from './util';

/**
 * Tracks visibility of the page.
 *
 * @returns Visibility state of the [`document`](https://developer.mozilla.org/docs/Web/API/Document), which is `'visible'` by default.
 *
 * @example
 * function Component() {
 *   const documentVisibility = useDocumentVisibility();
 *   if (documentVisibility === 'hidden') {
 *     // Reduce resource utilization to aid background page performance
 *   }
 *   // ...
 * }
 */
export default function useDocumentVisibility() {
  const [visibility, setVisibility] = useState(
    canUseDOM ? document.visibilityState : 'visible', // TODO: Consider using 'prerender'
  );

  useEffect(
    () =>
      managedEventListener(document, 'visibilitychange', () => {
        setVisibility(document.visibilityState);
      }),
    [],
  );

  return visibility;
}
