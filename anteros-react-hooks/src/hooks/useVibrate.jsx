import { useEffect } from 'react';
const isVibrationApiSupported = typeof navigator === 'object' && 'vibrate' in navigator;
const useVibrateMock = () => { };
function useVibrate(enabled = true, pattern = [1000, 1000], loop = true) {
    useEffect(() => {
        let interval;
        if (enabled) {
            navigator.vibrate(pattern);
            if (loop) {
                const duration = pattern instanceof Array ? pattern.reduce((a, b) => a + b) : pattern;
                interval = setInterval(() => {
                    navigator.vibrate(pattern);
                }, duration);
            }
        }
        return () => {
            if (enabled) {
                navigator.vibrate(0);
                if (loop) {
                    clearInterval(interval);
                }
            }
        };
    }, [enabled]);
}
export default isVibrationApiSupported ? useVibrate : useVibrateMock;
