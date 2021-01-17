import { createElement, createContext, useContext, useState } from 'react';

const createStateContext = (defaultInitialValue) => {
  const context = createContext(undefined);
  const providerFactory = (props, children) => createElement(context.Provider, props, children);

  const StateProvider= ({ children, initialValue }) => {
    const state = useState(initialValue !== undefined ? initialValue : defaultInitialValue);
    return providerFactory({ value: state }, children);
  };

  const useStateContext = () => {
    const state = useContext(context);
    if (state == null) {
      throw new Error(`useStateContext must be used inside a StateProvider.`);
    }
    return state;
  };

  return [useStateContext, StateProvider, context];
};

export default createStateContext;
