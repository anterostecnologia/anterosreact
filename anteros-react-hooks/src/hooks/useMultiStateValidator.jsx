import { useCallback, useEffect, useRef, useState } from 'react';
export function useMultiStateValidator(states, validator, initialValidity = [undefined]) {
    if (typeof states !== 'object') {
        throw new Error('states expected to be an object or array, got ' + typeof states);
    }
    const validatorInner = useRef(validator);
    const statesInner = useRef(states);
    validatorInner.current = validator;
    statesInner.current = states;
    const [validity, setValidity] = useState(initialValidity);
    const validate = useCallback(() => {
        if (validatorInner.current.length >= 2) {
            validatorInner.current(statesInner.current, setValidity);
        }
        else {
            setValidity(validatorInner.current(statesInner.current));
        }
    }, [setValidity]);
    useEffect(() => {
        validate();
    }, Object.values(states));
    return [validity, validate];
}