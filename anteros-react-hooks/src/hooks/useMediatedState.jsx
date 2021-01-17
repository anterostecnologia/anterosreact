import { useCallback, useRef, useState } from 'react';
export function useMediatedState(mediator, initialState) {
    const mediatorFn = useRef(mediator);
    const [state, setMediatedState] = useState(initialState);
    const setState = useCallback((newState) => {
        if (mediatorFn.current.length === 2) {
            mediatorFn.current(newState, setMediatedState);
        }
        else {
            setMediatedState(mediatorFn.current(newState));
        }
    }, [state]);
    return [state, setState];
}
