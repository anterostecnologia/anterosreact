import { useCallback, useEffect, useMemo, useRef } from 'react';
export default function useRafLoop(callback, initiallyActive = true) {
    const raf = useRef(null);
    const rafActivity = useRef(false);
    const rafCallback = useRef(callback);
    rafCallback.current = callback;
    const step = useCallback((time) => {
        if (rafActivity.current) {
            rafCallback.current(time);
            raf.current = requestAnimationFrame(step);
        }
    }, []);
    const result = useMemo(() => [
        () => {
            // stop
            if (rafActivity.current) {
                rafActivity.current = false;
                raf.current && cancelAnimationFrame(raf.current);
            }
        },
        () => {
            // start
            if (!rafActivity.current) {
                rafActivity.current = true;
                raf.current = requestAnimationFrame(step);
            }
        },
        () => rafActivity.current,
    ], []);
    useEffect(() => {
        if (initiallyActive) {
            result[1]();
        }
        return result[0];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return result;
}
