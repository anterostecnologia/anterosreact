import { useEffect, useMemo, useState } from 'react';

import { JSONValue } from './types';
import { dethunkify } from './util';

export default function useStorage(
  getStorage,
  key,
  initialValue,
  errorCallback,
) {
  const storage = useMemo(() => {
    try {
      // Check if the storage object is defined and available
      // Prior to Firefox 70, localStorage may be null
      return getStorage();
      // eslint-disable-next-line no-empty
    } catch {}
    return null;
  }, [getStorage]);

  const [value, setValue] = useState(() => {
    const serializedValue = storage?.getItem(key);
    if (serializedValue == null) return dethunkify(initialValue);

    try {
      return JSON.parse(serializedValue);
    } catch {
      // Backwards compatibility with past stored non-serialized values
      return serializedValue;
    }
  });

  useEffect(() => {
    if (storage) {
      try {
        storage.setItem(key, JSON.stringify(value));
      } catch (error) {
        errorCallback?.(error);
      }
    }
  }, [errorCallback, key, storage, value]);

  return [value, setValue];
}
