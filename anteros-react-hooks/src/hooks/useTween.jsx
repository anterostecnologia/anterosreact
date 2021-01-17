import { easing } from 'ts-easing';
import useRaf from './useRaf';
const useTween = (easingName = 'inCirc', ms = 200, delay = 0) => {
    debugger
    const fn = easing[easingName];
    const t = useRaf(ms, delay);
    if (process.env.NODE_ENV !== 'production') {
        if (typeof fn !== 'function') {
            console.error('useTween() expected "easingName" property to be a valid easing function name, like:' +
                '"' +
                Object.keys(easing).join('", "') +
                '".');
            console.trace();
            return 0;
        }
    }
    return fn(t);
};
export default useTween;