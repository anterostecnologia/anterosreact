import { useCallback } from 'react';
import useMountedState from './useMountedState';
const usePromise = () => {
    const isMounted = useMountedState();
    return useCallback((promise) => new Promise((resolve, reject) => {
        const onValue = (value) => {
            isMounted() && resolve(value);
        };
        const onError = (error) => {
            isMounted() && reject(error);
        };
        promise.then(onValue, onError);
    }), []);
};
export default usePromise;