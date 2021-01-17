import { forwardRef, useRef, useEffect, } from 'react';
export default function useEnsuredForwardedRef(forwardedRef) {
    const ensuredRef = useRef(forwardedRef && forwardedRef.current);
    useEffect(() => {
        if (!forwardedRef) {
            return;
        }
        forwardedRef.current = ensuredRef.current;
    }, [forwardedRef]);
    return ensuredRef;
}
export function ensuredForwardRef(Component) {
    return forwardRef((props, ref) => {
        const ensuredRef = useEnsuredForwardedRef(ref);
        return Component(props, ensuredRef);
    });
}