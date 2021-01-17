import { useState, useMemo, useCallback } from 'react';

const useMap = (initialMap={})=> {
  const [map, set] = useState(initialMap);

  const stableActions = useMemo(
    () => ({
      set: (key, entry) => {
        set((prevMap) => ({
          ...prevMap,
          [key]: entry,
        }));
      },
      setAll: (newMap) => {
        set(newMap);
      },
      remove: (key) => {
        set((prevMap) => {
          const { [key]: omit, ...rest } = prevMap;
          return rest;
        });
      },
      reset: () => set(initialMap),
    }),
    [set]
  );

  const utils = {
    get: useCallback((key) => map[key], [map]),
    ...stableActions,
  };

  return [map, utils];
};

export default useMap;
