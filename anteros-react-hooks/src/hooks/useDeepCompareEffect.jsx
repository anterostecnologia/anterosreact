import { isDeepEqual } from './util';
import useCustomCompareEffect from './useCustomCompareEffect';
const isPrimitive = (val) => val !== Object(val);
const useDeepCompareEffect = (effect, deps) => {
    if (process.env.NODE_ENV !== 'production') {
        if (!(deps instanceof Array) || !deps.length) {
            console.warn('`useDeepCompareEffect` should not be used with no dependencies. Use React.useEffect instead.');
        }
        if (deps.every(isPrimitive)) {
            console.warn('`useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.');
        }
    }
    useCustomCompareEffect(effect, deps, isDeepEqual);
};
export default useDeepCompareEffect;