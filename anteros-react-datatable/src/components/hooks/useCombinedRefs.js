import { useCallback } from 'react';

export function useCombinedRefs(...refs) {
  return useCallback(
    (handle) => {
      for (const ref of refs) {
        if (typeof ref === 'function') {
          ref(handle);
        } else if (ref !== null) {
          // @ts-expect-error: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31065
          ref.current = handle;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
