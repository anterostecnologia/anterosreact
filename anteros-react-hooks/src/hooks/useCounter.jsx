import { useMemo } from 'react';
import useGetSet from './useGetSet';
import { resolveHookState } from '../util/resolveHookState';
export default function useCounter(initialValue = 0, max = null, min = null) {
    let init = resolveHookState(initialValue);
    typeof init !== 'number' && console.error('initialValue has to be a number, got ' + typeof initialValue);
    if (typeof min === 'number') {
        init = Math.max(init, min);
    }
    else if (min !== null) {
        console.error('min has to be a number, got ' + typeof min);
    }
    if (typeof max === 'number') {
        init = Math.min(init, max);
    }
    else if (max !== null) {
        console.error('max has to be a number, got ' + typeof max);
    }
    const [get, setInternal] = useGetSet(init);
    return [
        get(),
        useMemo(() => {
            const set = (newState) => {
                const prevState = get();
                let rState = resolveHookState(newState, prevState);
                if (prevState !== rState) {
                    if (typeof min === 'number') {
                        rState = Math.max(rState, min);
                    }
                    if (typeof max === 'number') {
                        rState = Math.min(rState, max);
                    }
                    prevState !== rState && setInternal(rState);
                }
            };
            return {
                get,
                set,
                inc: (delta = 1) => {
                    const rDelta = resolveHookState(delta, get());
                    if (typeof rDelta !== 'number') {
                        console.error('delta has to be a number or function returning a number, got ' + typeof rDelta);
                    }
                    set((num) => num + rDelta);
                },
                dec: (delta = 1) => {
                    const rDelta = resolveHookState(delta, get());
                    if (typeof rDelta !== 'number') {
                        console.error('delta has to be a number or function returning a number, got ' + typeof rDelta);
                    }
                    set((num) => num - rDelta);
                },
                reset: (value = init) => {
                    const rValue = resolveHookState(value, get());
                    if (typeof rValue !== 'number') {
                        console.error('value has to be a number or function returning a number, got ' + typeof rValue);
                    }
                    init = rValue;
                    set(rValue);
                },
            };
        }, [init, min, max]),
    ];
}