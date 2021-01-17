import { useState, useCallback } from 'react';
import Cookies from 'js-cookie';
const useCookie = (cookieName) => {
    const [value, setValue] = useState(() => Cookies.get(cookieName) || null);
    const updateCookie = useCallback((newValue, options) => {
        Cookies.set(cookieName, newValue, options);
        setValue(newValue);
    }, [cookieName]);
    const deleteCookie = useCallback(() => {
        Cookies.remove(cookieName);
        setValue(null);
    }, [cookieName]);
    return [value, updateCookie, deleteCookie];
};
export default useCookie;