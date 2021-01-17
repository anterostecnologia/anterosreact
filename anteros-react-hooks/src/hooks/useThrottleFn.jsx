import { useEffect, useRef, useState } from 'react';
import useUnmount from './useUnmount';
const useThrottleFn = (fn, ms = 200, args) => {
    const [state, setState] = useState(null);
    const timeout = useRef();
    const nextArgs = useRef();
    useEffect(() => {
        if (!timeout.current) {
            setState(fn(...args));
            const timeoutCallback = () => {
                if (nextArgs.current) {
                    setState(fn(...nextArgs.current));
                    nextArgs.current = undefined;
                    timeout.current = setTimeout(timeoutCallback, ms);
                }
                else {
                    timeout.current = undefined;
                }
            };
            timeout.current = setTimeout(timeoutCallback, ms);
        }
        else {
            nextArgs.current = args;
        }
    }, args);
    useUnmount(() => {
        timeout.current && clearTimeout(timeout.current);
    });
    return state;
};
export default useThrottleFn;