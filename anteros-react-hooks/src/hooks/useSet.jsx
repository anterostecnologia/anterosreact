import { useState, useMemo, useCallback } from 'react';

const useSet = (initialSet = new Set()) => {
  const [set, setSet] = useState(initialSet);

  const stableActions = useMemo(() => {
    const add = (item) => setSet((prevSet) => new Set([...Array.from(prevSet), item]));
    const remove = (item) => setSet((prevSet) => new Set(Array.from(prevSet).filter((i) => i !== item)));
    const toggle = (item) =>
      setSet((prevSet) =>
        prevSet.has(item)
          ? new Set(Array.from(prevSet).filter((i) => i !== item))
          : new Set([...Array.from(prevSet), item])
      );

    return { add, remove, toggle, reset: () => setSet(initialSet) };
  }, [setSet]);

  const utils = {
    has: useCallback((item) => set.has(item), [set]),
    ...stableActions,
  };

  return [set, utils];
};

export default useSet;
