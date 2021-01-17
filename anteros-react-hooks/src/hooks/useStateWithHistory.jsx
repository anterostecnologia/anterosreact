import { useCallback, useMemo, useRef, useState } from 'react';
import { useFirstMountState } from './useFirstMountState';
import { resolveHookState } from '../util/resolveHookState';
export function useStateWithHistory(initialState, capacity = 10, initialHistory) {
    if (capacity < 1) {
        throw new Error(`Capacity has to be greater than 1, got '${capacity}'`);
    }
    const isFirstMount = useFirstMountState();
    const [state, innerSetState] = useState(initialState);
    const history = useRef((initialHistory !== null && initialHistory !== void 0 ? initialHistory : []));
    const historyPosition = useRef(0);
    // do the states manipulation only on first mount, no sense to load re-renders with useless calculations
    if (isFirstMount) {
        if (history.current.length) {
            // if last element of history !== initial - push initial to history
            if (history.current[history.current.length - 1] !== initialState) {
                history.current.push(initialState);
            }
            // if initial history bigger that capacity - crop the first elements out
            if (history.current.length > capacity) {
                history.current = history.current.slice(history.current.length - capacity);
            }
        }
        else {
            // initiate the history with initial state
            history.current.push(initialState);
        }
        historyPosition.current = history.current.length && history.current.length - 1;
    }
    const setState = useCallback((newState) => {
        innerSetState((currentState) => {
            newState = resolveHookState(newState);
            // is state has changed
            if (newState !== currentState) {
                // if current position is not the last - pop element to the right
                if (historyPosition.current < history.current.length - 1) {
                    history.current = history.current.slice(0, historyPosition.current + 1);
                }
                historyPosition.current = history.current.push(newState) - 1;
                // if capacity is reached - shift first elements
                if (history.current.length > capacity) {
                    history.current = history.current.slice(history.current.length - capacity);
                }
            }
            return newState;
        });
    }, [state, capacity]);
    const historyState = useMemo(() => ({
        history: history.current,
        position: historyPosition.current,
        capacity,
        back: (amount = 1) => {
            // don't do anything if we already at the left border
            if (!historyPosition.current) {
                return;
            }
            innerSetState(() => {
                historyPosition.current -= Math.min(amount, historyPosition.current);
                return history.current[historyPosition.current];
            });
        },
        forward: (amount = 1) => {
            // don't do anything if we already at the right border
            if (historyPosition.current === history.current.length - 1) {
                return;
            }
            innerSetState(() => {
                historyPosition.current = Math.min(historyPosition.current + amount, history.current.length - 1);
                return history.current[historyPosition.current];
            });
        },
        go: (position) => {
            if (position === historyPosition.current) {
                return;
            }
            innerSetState(() => {
                historyPosition.current =
                    position < 0
                        ? Math.max(history.current.length + position, 0)
                        : Math.min(history.current.length - 1, position);
                return history.current[historyPosition.current];
            });
        },
    }), [state]);
    return [state, setState, historyState];
}