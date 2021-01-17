import { useState } from 'react';
import useEffectOnce from './useEffectOnce';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

export function createGlobalState(initialState) {
  const store = {
    state: initialState,
    setState(state) {
      store.state = state;
      store.setters.forEach((setter) => setter(store.state));
    },
    setters: [],
  };

  return () => {
    const [globalState, stateSetter] = useState(store.state);

    useEffectOnce(() => () => {
      store.setters = store.setters.filter((setter) => setter !== stateSetter);
    });

    useIsomorphicLayoutEffect(() => {
      if (!store.setters.includes(stateSetter)) {
        store.setters.push(stateSetter);
      }
    });

    return [globalState, store.setState];
  };
}

export default createGlobalState;
