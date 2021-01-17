import { useState } from 'react';


const useQueue = (initialValue= [])=> {
  const [state, set] = useState(initialValue);
  return {
    add: (value) => {
      set((queue) => [...queue, value]);
    },
    remove: () => {
      let result;
      set(([first, ...rest]) => {
        result = first;
        return rest;
      });
      return result;
    },
    get first() {
      return state[0];
    },
    get last() {
      return state[state.length - 1];
    },
    get size() {
      return state.length;
    },
  };
};

export default useQueue;
