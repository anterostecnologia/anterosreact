import { useEffect, useState } from 'react';
import { managedEventListener } from './util';

// Source: https://w3c.github.io/deviceorientation/#dictdef-devicemotioneventinit
const initialState = {
  acceleration: null,
  accelerationIncludingGravity: null,
  rotationRate: null,
  interval: 0,
};

/**
 * Tracks acceleration and rotation rate of the device.
 *
 * @returns Own properties of the last corresponding event.
 *
 * @example
 * function Component() {
 *   const { acceleration, rotationRate, interval } = useDeviceMotion();
 *   // ...
 * }
 */
export default function useDeviceMotion() {
  const [motion, setMotion] = useState(initialState);

  // TODO: Request permission if necessary, see https://github.com/w3c/deviceorientation/issues/57

  useEffect(
    () =>
      managedEventListener(window, 'devicemotion', (event) => {
        setMotion(event);
      }),
    [],
  );

  return motion;
}
