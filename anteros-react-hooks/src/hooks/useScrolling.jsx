import { useEffect, useState } from 'react';
const useScrolling = (ref) => {
    const [scrolling, setScrolling] = useState(false);
    useEffect(() => {
        if (ref.current) {
            let scrollingTimeout;
            const handleScrollEnd = () => {
                setScrolling(false);
            };
            const handleScroll = () => {
                setScrolling(true);
                clearTimeout(scrollingTimeout);
                scrollingTimeout = setTimeout(() => handleScrollEnd(), 150);
            };
            ref.current.addEventListener('scroll', handleScroll, false);
            return () => {
                if (ref.current) {
                    ref.current.removeEventListener('scroll', handleScroll, false);
                }
            };
        }
        return () => { };
    }, [ref]);
    return scrolling;
};
export default useScrolling;
