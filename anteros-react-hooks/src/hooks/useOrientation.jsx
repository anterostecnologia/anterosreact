import { useEffect, useState } from 'react';
import { off, on } from './util';
const defaultState = {
    angle: 0,
    type: 'landscape-primary',
};
const useOrientation = (initialState = defaultState) => {
    const screen = window.screen;
    const [state, setState] = useState(initialState);
    useEffect(() => {
        let mounted = true;
        const onChange = () => {
            if (mounted) {
                const { orientation } = screen;
                if (orientation) {
                    const { angle, type } = orientation;
                    setState({ angle, type });
                }
                else if (window.orientation) {
                    setState({
                        angle: typeof window.orientation === 'number' ? window.orientation : 0,
                        type: '',
                    });
                }
                else {
                    setState(initialState);
                }
            }
        };
        on(window, 'orientationchange', onChange);
        onChange();
        return () => {
            mounted = false;
            off(window, 'orientationchange', onChange);
        };
    }, []);
    return state;
};
export default useOrientation;