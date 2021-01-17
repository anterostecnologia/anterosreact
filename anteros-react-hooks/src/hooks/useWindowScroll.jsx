import { useEffect } from 'react';
import { isClient } from './util';
import useRafState from './useRafState';
const useWindowScroll = () => {
    const [state, setState] = useRafState({
        x: isClient ? window.pageXOffset : 0,
        y: isClient ? window.pageYOffset : 0,
    });
    useEffect(() => {
        const handler = () => {
            setState({
                x: window.pageXOffset,
                y: window.pageYOffset,
            });
        };
        window.addEventListener('scroll', handler, {
            capture: false,
            passive: true,
        });
        return () => {
            window.removeEventListener('scroll', handler);
        };
    }, []);
    return state;
};
export default useWindowScroll;