import { useState } from 'react';
import useKey from './useKey';

const useKeyPress = (keyFilter) => {
  const [state, set] = useState([false, null]);
  useKey(keyFilter, (event) => set([true, event]), { event: 'keydown' }, [state]);
  useKey(keyFilter, (event) => set([false, event]), { event: 'keyup' }, [state]);
  return state;
};

export default useKeyPress;
