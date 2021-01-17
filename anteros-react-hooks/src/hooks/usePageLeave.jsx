import { useEffect } from 'react';
const usePageLeave = (onPageLeave, args = []) => {
    useEffect(() => {
        if (!onPageLeave) {
            return;
        }
        const handler = (event) => {
            event = event ? event : window.event;
            const from = event.relatedTarget || event.toElement;
            if (!from || from.nodeName === 'HTML') {
                onPageLeave();
            }
        };
        document.addEventListener('mouseout', handler);
        return () => {
            document.removeEventListener('mouseout', handler);
        };
    }, args);
};
export default usePageLeave;