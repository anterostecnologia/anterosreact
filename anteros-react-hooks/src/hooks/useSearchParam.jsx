import { useState, useEffect } from 'react';
const getValue = (search, param) => new URLSearchParams(search).get(param);
const useSearchParam = (param) => {
    const location = window.location;
    const [value, setValue] = useState(() => getValue(location.search, param));
    useEffect(() => {
        const onChange = () => {
            setValue(getValue(location.search, param));
        };
        window.addEventListener('popstate', onChange);
        window.addEventListener('pushstate', onChange);
        window.addEventListener('replacestate', onChange);
        return () => {
            window.removeEventListener('popstate', onChange);
            window.removeEventListener('pushstate', onChange);
            window.removeEventListener('replacestate', onChange);
        };
    }, []);
    return value;
};
const useSearchParamServer = () => null;
export default typeof window === 'object' ? useSearchParam : useSearchParamServer;
