import { createElement, createContext, useContext, useReducer } from 'react';

const createReducerContext = (
  reducer,
  defaultInitialState
) => {
  const context = createContext(undefined);
  const providerFactory = (props, children) => createElement(context.Provider, props, children);

  const ReducerProvider = ({ children, initialState }) => {
    const state = useReducer(reducer, initialState !== undefined ? initialState : defaultInitialState);
    return providerFactory({ value: state }, children);
  };

  const useReducerContext = () => {
    const state = useContext(context);
    if (state == null) {
      throw new Error(`useReducerContext must be used inside a ReducerProvider.`);
    }
    return state;
  };

  return [useReducerContext, ReducerProvider, context];
};

export default createReducerContext;