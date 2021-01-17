import { useEffect, useState } from 'react';
import { isClient } from './util';

const useSessionStorage = (key, initialValue, raw) => {
  if (!isClient) {
    return [initialValue, () => {}];
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [state, setState] = useState(() => {
    try {
      const sessionStorageValue = sessionStorage.getItem(key);
      if (typeof sessionStorageValue !== 'string') {
        sessionStorage.setItem(key, raw ? String(initialValue) : JSON.stringify(initialValue));
        return initialValue;
      } else {
        return raw ? sessionStorageValue : JSON.parse(sessionStorageValue || 'null');
      }
    } catch {
      // If user is in private mode or has storage restriction
      // sessionStorage can throw. JSON.parse and JSON.stringify
      // cat throw, too.
      return initialValue;
    }
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    try {
      const serializedState = raw ? String(state) : JSON.stringify(state);
      sessionStorage.setItem(key, serializedState);
    } catch {
      // If user is in private mode or has storage restriction
      // sessionStorage can throw. Also JSON.stringify can throw.
    }
  });

  return [state, setState];
};

export default useSessionStorage;
