import { useMemo, useRef, useEffect } from 'react';
const useUnmountPromise = () => {
    const refUnmounted = useRef(false);
    useEffect(() => () => {
        refUnmounted.current = true;
    });
    const wrapper = useMemo(() => {
        const race = (promise, onError) => {
            const newPromise = new Promise((resolve, reject) => {
                promise.then((result) => {
                    if (!refUnmounted.current)
                        resolve(result);
                }, (error) => {
                    if (!refUnmounted.current)
                        reject(error);
                    else if (onError)
                        onError(error);
                    else
                        console.error('useUnmountPromise', error);
                });
            });
            return newPromise;
        };
        return race;
    }, []);
    return wrapper;
};
export default useUnmountPromise;
