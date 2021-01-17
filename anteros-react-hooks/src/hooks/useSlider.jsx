import { useEffect, useRef } from 'react';
import { isClient, off, on } from './util';
import useMountedState from './useMountedState';
import useSetState from './useSetState';
const noop = () => { };
const useSlider = (ref, options = {}) => {
    const isMounted = useMountedState();
    const isSliding = useRef(false);
    const valueRef = useRef(0);
    const frame = useRef(0);
    const [state, setState] = useSetState({
        isSliding: false,
        value: 0,
    });
    valueRef.current = state.value;
    useEffect(() => {
        if (isClient) {
            const styles = options.styles === undefined ? true : options.styles;
            const reverse = options.reverse === undefined ? false : options.reverse;
            if (ref.current && styles) {
                ref.current.style.userSelect = 'none';
            }
            const startScrubbing = () => {
                if (!isSliding.current && isMounted()) {
                    (options.onScrubStart || noop)();
                    isSliding.current = true;
                    setState({ isSliding: true });
                    bindEvents();
                }
            };
            const stopScrubbing = () => {
                if (isSliding.current && isMounted()) {
                    (options.onScrubStop || noop)(valueRef.current);
                    isSliding.current = false;
                    setState({ isSliding: false });
                    unbindEvents();
                }
            };
            const onMouseDown = (event) => {
                startScrubbing();
                onMouseMove(event);
            };
            const onMouseMove = options.vertical
                ? (event) => onScrub(event.clientY)
                : (event) => onScrub(event.clientX);
            const onTouchStart = (event) => {
                startScrubbing();
                onTouchMove(event);
            };
            const onTouchMove = options.vertical
                ? (event) => onScrub(event.changedTouches[0].clientY)
                : (event) => onScrub(event.changedTouches[0].clientX);
            const bindEvents = () => {
                on(document, 'mousemove', onMouseMove);
                on(document, 'mouseup', stopScrubbing);
                on(document, 'touchmove', onTouchMove);
                on(document, 'touchend', stopScrubbing);
            };
            const unbindEvents = () => {
                off(document, 'mousemove', onMouseMove);
                off(document, 'mouseup', stopScrubbing);
                off(document, 'touchmove', onTouchMove);
                off(document, 'touchend', stopScrubbing);
            };
            const onScrub = (clientXY) => {
                cancelAnimationFrame(frame.current);
                frame.current = requestAnimationFrame(() => {
                    if (isMounted() && ref.current) {
                        const rect = ref.current.getBoundingClientRect();
                        const pos = options.vertical ? rect.top : rect.left;
                        const length = options.vertical ? rect.height : rect.width;
                        // Prevent returning 0 when element is hidden by CSS
                        if (!length) {
                            return;
                        }
                        let value = (clientXY - pos) / length;
                        if (value > 1) {
                            value = 1;
                        }
                        else if (value < 0) {
                            value = 0;
                        }
                        if (reverse) {
                            value = 1 - value;
                        }
                        setState({
                            value,
                        });
                        (options.onScrub || noop)(value);
                    }
                });
            };
            on(ref.current, 'mousedown', onMouseDown);
            on(ref.current, 'touchstart', onTouchStart);
            return () => {
                off(ref.current, 'mousedown', onMouseDown);
                off(ref.current, 'touchstart', onTouchStart);
            };
        }
        else {
            return undefined;
        }
    }, [ref, options.vertical]);
    return state;
};
export default useSlider;