import { useCallback, useRef } from 'react';
import useUpdate from './useUpdate';
const useGetSetState = (initialState = {}) => {
    if (process.env.NODE_ENV !== 'production') {
        if (typeof initialState !== 'object') {
            console.error('useGetSetState initial state must be an object.');
        }
    }
    const update = useUpdate();
    const state = useRef(Object.assign({}, initialState));
    const get = useCallback(() => state.current, []);
    const set = useCallback((patch) => {
        if (!patch) {
            return;
        }
        if (process.env.NODE_ENV !== 'production') {
            if (typeof patch !== 'object') {
                console.error('useGetSetState setter patch must be an object.');
            }
        }
        Object.assign(state.current, patch);
        update();
    }, []);
    return [get, set];
};
export default useGetSetState;