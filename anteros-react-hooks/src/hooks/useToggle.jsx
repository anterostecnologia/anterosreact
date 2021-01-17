import { useReducer } from 'react';
const toggleReducer = (state, nextValue) => (typeof nextValue === 'boolean' ? nextValue : !state);
const useToggle = (initialValue) => {
    return useReducer(toggleReducer, initialValue);
};
export default useToggle;
