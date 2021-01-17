import { useState, useCallback } from 'react';
import { isClient } from './util';
const noop = () => { };
const useLocalStorage = (key, initialValue, options) => {
    if (!isClient) {
        return [initialValue, noop, noop];
    }
    if (!key) {
        throw new Error('useLocalStorage key may not be falsy');
    }
    const deserializer = options ? (options.raw ? (value) => value : options.deserializer) : JSON.parse;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state, setState] = useState(() => {
        try {
            const serializer = options ? (options.raw ? String : options.serializer) : JSON.stringify;
            const localStorageValue = localStorage.getItem(key);
            if (localStorageValue !== null) {
                return deserializer(localStorageValue);
            }
            else {
                initialValue && localStorage.setItem(key, serializer(initialValue));
                return initialValue;
            }
        }
        catch (_a) {
            return initialValue;
        }
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const set = useCallback((valOrFunc) => {
        try {
            const newState = typeof valOrFunc === 'function' ? valOrFunc(state) : valOrFunc;
            if (typeof newState === 'undefined')
                return;
            let value;
            if (options)
                if (options.raw)
                    if (typeof newState === 'string')
                        value = newState;
                    else
                        value = JSON.stringify(newState);
                else if (options.serializer)
                    value = options.serializer(newState);
                else
                    value = JSON.stringify(newState);
            else
                value = JSON.stringify(newState);
            localStorage.setItem(key, value);
            setState(deserializer(value));
        }
        catch (_a) {

        }
    }, [key, setState]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const remove = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setState(undefined);
        }
        catch (_a) {

        }
    }, [key, setState]);
    return [state, set, remove];
};
export default useLocalStorage;