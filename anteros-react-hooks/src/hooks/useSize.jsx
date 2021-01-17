import * as React from 'react';
import { isClient } from './util';
const { useState, useEffect, useRef } = React;
const DRAF = (callback) => setTimeout(callback, 35);
const useSize = (element, { width = Infinity, height = Infinity } = {}) => {
    if (!isClient) {
        return [typeof element === 'function' ? element({ width, height }) : element, { width, height }];
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state, setState] = useState({ width, height });
    if (typeof element === 'function') {
        element = element(state);
    }
    const style = element.props.style || {};
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ref = useRef(null);
    let window = null;
    const setSize = () => {
        const iframe = ref.current;
        const size = iframe
            ? {
                width: iframe.offsetWidth,
                height: iframe.offsetHeight,
            }
            : { width, height };
        setState(size);
    };
    const onWindow = (windowToListenOn) => {
        windowToListenOn.addEventListener('resize', setSize);
        DRAF(setSize);
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const iframe = ref.current;
        if (!iframe) {
            // iframe will be undefined if component is already unmounted
            return;
        }
        if (iframe.contentWindow) {
            window = iframe.contentWindow;
            onWindow(window);
        }
        else {
            const onLoad = () => {
                iframe.removeEventListener('load', onLoad);
                window = iframe.contentWindow;
                onWindow(window);
            };
            iframe.addEventListener('load', onLoad);
        }
        return () => {
            if (window && window.removeEventListener) {
                window.removeEventListener('resize', setSize);
            }
        };
    }, []);
    style.position = 'relative';
    const sized = React.cloneElement(element, { style }, ...[
        React.createElement('iframe', {
            ref,
            style: {
                background: 'transparent',
                border: 'none',
                height: '100%',
                left: 0,
                position: 'absolute',
                top: 0,
                width: '100%',
                zIndex: -1,
            },
        }),
        ...React.Children.toArray(element.props.children),
    ]);
    return [sized, state];
};
export default useSize;