import { useRef, useEffect } from 'react';
const DEFAULT_USE_TITLE_OPTIONS = {
    restoreOnUnmount: false,
};
export default function useTitle(title, options = DEFAULT_USE_TITLE_OPTIONS) {
    const prevTitleRef = useRef(document.title);
    document.title = title;
    useEffect(() => {
        if (options && options.restoreOnUnmount) {
            return () => {
                document.title = prevTitleRef.current;
            };
        }
        else {
            return;
        }
    }, []);
}