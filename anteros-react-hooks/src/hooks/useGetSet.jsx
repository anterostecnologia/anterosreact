import { useMemo, useRef } from 'react';
import useUpdate from './useUpdate';
import {resolveHookState} from '../util/resolveHookState';
export default function useGetSet(initialState) {
    const state = useRef(resolveHookState(initialState));
    const update = useUpdate();
    return useMemo(() => [
        // get
        () => state.current,
        // set
        (newState) => {
            state.current = resolveHookState(newState, state.current);
            update();
        },
    ], []);
}
