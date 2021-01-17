import { useEffect, useRef } from 'react';
import { setHarmonicInterval, clearHarmonicInterval } from 'set-harmonic-interval';
const useHarmonicIntervalFn = (fn, delay = 0) => {
    const latestCallback = useRef(() => { });
    useEffect(() => {
        latestCallback.current = fn;
    });
    useEffect(() => {
        if (delay !== null) {
            const interval = setHarmonicInterval(() => latestCallback.current(), delay);
            return () => clearHarmonicInterval(interval);
        }
        return undefined;
    }, [delay]);
};
export default useHarmonicIntervalFn;