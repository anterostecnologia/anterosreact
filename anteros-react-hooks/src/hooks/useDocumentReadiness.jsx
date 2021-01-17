import { useEffect, useState } from 'react';

import { canUseDOM, managedEventListener } from './util';

/**
 * Tracks loading state of the page.
 *
 * @returns Readiness of the [`document`](https://developer.mozilla.org/docs/Web/API/Document), which is `'loading'` by default.
 *
 * @example
 * function Component() {
 *   const documentReadiness = useDocumentReadiness();
 *   if (documentReadiness === 'interactive') {
 *     // You may interact with any element of the document from now
 *   }
 *   // ...
 * }
 */
export default function useDocumentReadiness() {
  const [readiness, setReadiness] = useState(
    canUseDOM ? document.readyState : 'loading',
  );

  useEffect(
    () =>
      managedEventListener(document, 'readystatechange', () => {
        setReadiness(document.readyState);
      }),
    [],
  );

  return readiness;
}
