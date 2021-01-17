import { useEffect, useState } from 'react';
import { isClient, off, on } from './util';
const patchHistoryMethod = (method) => {
    const history = window.history;
    const original = history[method];
    history[method] = function (state) {
        const result = original.apply(this, arguments);
        const event = new Event(method.toLowerCase());
        event.state = state;
        window.dispatchEvent(event);
        return result;
    };
};
if (isClient) {
    patchHistoryMethod('pushState');
    patchHistoryMethod('replaceState');
}
const useLocationServer = () => ({
    trigger: 'load',
    length: 1,
});
const buildState = (trigger) => {
    const { state, length } = window.history;
    const { hash, host, hostname, href, origin, pathname, port, protocol, search } = window.location;
    return {
        trigger,
        state,
        length,
        hash,
        host,
        hostname,
        href,
        origin,
        pathname,
        port,
        protocol,
        search,
    };
};
const useLocationBrowser = () => {
    const [state, setState] = useState(buildState('load'));
    useEffect(() => {
        const onPopstate = () => setState(buildState('popstate'));
        const onPushstate = () => setState(buildState('pushstate'));
        const onReplacestate = () => setState(buildState('replacestate'));
        on(window, 'popstate', onPopstate);
        on(window, 'pushstate', onPushstate);
        on(window, 'replacestate', onReplacestate);
        return () => {
            off(window, 'popstate', onPopstate);
            off(window, 'pushstate', onPushstate);
            off(window, 'replacestate', onReplacestate);
        };
    }, []);
    return state;
};
const hasEventConstructor = typeof Event === 'function';
export default isClient && hasEventConstructor ? useLocationBrowser : useLocationServer;