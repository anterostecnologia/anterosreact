import { useState } from 'react';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';
function useObservable(observable$, initialValue) {
    const [value, update] = useState(initialValue);
    useIsomorphicLayoutEffect(() => {
        const s = observable$.subscribe(update);
        return () => s.unsubscribe();
    }, [observable$]);
    return value;
}
export default useObservable;
