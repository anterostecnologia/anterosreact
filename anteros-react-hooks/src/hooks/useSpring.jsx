import { useEffect, useMemo, useState } from 'react';
import { SpringSystem } from 'rebound';
const useSpring = (targetValue = 0, tension = 50, friction = 3) => {
    const [spring, setSpring] = useState(null);
    const [value, setValue] = useState(targetValue);
    // memoize listener to being able to unsubscribe later properly, otherwise
    // listener fn will be different on each re-render and wouldn't unsubscribe properly.
    const listener = useMemo(() => ({
        onSpringUpdate: (currentSpring) => {
            const newValue = currentSpring.getCurrentValue();
            setValue(newValue);
        },
    }), []);
    useEffect(() => {
        if (!spring) {
            const newSpring = new SpringSystem().createSpring(tension, friction);
            newSpring.setCurrentValue(targetValue);
            setSpring(newSpring);
            newSpring.addListener(listener);
        }
        return () => {
            if (spring) {
                spring.removeListener(listener);
                setSpring(null);
            }
        };
    }, [tension, friction, spring]);
    useEffect(() => {
        if (spring) {
            spring.setEndValue(targetValue);
        }
    }, [targetValue]);
    return value;
};
export default useSpring;