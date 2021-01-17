import { useEffect, useState } from 'react';
import { canUseDOM, managedEventListener } from './util';
/**
 * Tracks information about the network's availability.
 *
 * ⚠️ _This attribute is inherently unreliable. A computer can be connected to a network without having internet access._
 *
 * @returns `false` if the user agent is definitely offline, or `true` if it might be online.
 *
 * @example
 * function Component() {
 *   const isOnline = useNetworkAvailability();
 *   // ...
 * }
 */
export default function useNetworkAvailability() {
    const [online, setOnline] = useState(canUseDOM ? navigator.onLine : true);
    useEffect(() => {
        const cleanup1 = managedEventListener(window, 'offline', () => {
            setOnline(false);
        });
        const cleanup2 = managedEventListener(window, 'online', () => {
            setOnline(true);
        });
        return () => {
            cleanup1();
            cleanup2();
        };
    }, []);
    return online;
}