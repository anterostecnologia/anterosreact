import { useEffect } from 'react';
import useRafState from './useRafState';
const useScroll = (ref) => {
    if (process.env.NODE_ENV === 'development') {
        if (typeof ref !== 'object' || typeof ref.current === 'undefined') {
            console.error('`useScroll` expects a single ref argument.');
        }
    }
    const [state, setState] = useRafState({
        x: 0,
        y: 0,
    });
    useEffect(() => {
        const handler = () => {
            if (ref.current) {
                setState({
                    x: ref.current.scrollLeft,
                    y: ref.current.scrollTop,
                });
            }
        };
        if (ref.current) {
            ref.current.addEventListener('scroll', handler, {
                capture: false,
                passive: true,
            });
        }
        return () => {
            if (ref.current) {
                ref.current.removeEventListener('scroll', handler);
            }
        };
    }, [ref]);
    return state;
};
export default useScroll;