import useKeyPressDefault from './useKeyPress';
import useUpdateEffect from './useUpdateEffect';
const useKeyPressEvent = (key, keydown, keyup, useKeyPress = useKeyPressDefault) => {
    const [pressed, event] = useKeyPress(key);
    useUpdateEffect(() => {
        if (!pressed && keyup) {
            keyup(event);
        }
        else if (pressed && keydown) {
            keydown(event);
        }
    }, [pressed]);
};
export default useKeyPressEvent;