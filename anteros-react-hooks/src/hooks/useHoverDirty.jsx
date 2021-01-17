import { useEffect, useState } from 'react';
const useHoverDirty = (ref, enabled = true) => {
    if (process.env.NODE_ENV === 'development') {
        if (typeof ref !== 'object' || typeof ref.current === 'undefined') {
            console.error('useHoverDirty expects a single ref argument.');
        }
    }
    const [value, setValue] = useState(false);
    useEffect(() => {
        const onMouseOver = () => setValue(true);
        const onMouseOut = () => setValue(false);
        if (enabled && ref && ref.current) {
            ref.current.addEventListener('mouseover', onMouseOver);
            ref.current.addEventListener('mouseout', onMouseOut);
        }
        const { current } = ref;
        return () => {
            if (enabled && current) {
                current.removeEventListener('mouseover', onMouseOver);
                current.removeEventListener('mouseout', onMouseOut);
            }
        };
    }, [enabled, ref]);
    return value;
};
export default useHoverDirty;