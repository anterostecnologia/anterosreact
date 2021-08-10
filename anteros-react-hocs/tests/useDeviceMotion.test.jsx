import { fireEvent } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import useDeviceMotion  from '../src/hooks/useDeviceMotion';

class DeviceMotionEvent extends Event {
    constructor(type, eventInitDict = {}) {
        super(type, eventInitDict);
        this.acceleration = Object.assign({ x: null, y: null, z: null }, eventInitDict.acceleration);
        this.accelerationIncludingGravity = Object.assign({ x: null, y: null, z: null }, eventInitDict.accelerationIncludingGravity);
        this.rotationRate = Object.assign({ alpha: null, beta: null, gamma: null }, eventInitDict.rotationRate);
        this.interval = eventInitDict.interval || 0;
    }
}
test('device lying flat on a horizontal surface with the screen upmost', () => {
    const { result } = renderHook(() => useDeviceMotion());
    expect(result.current.acceleration).toBe(null);
    const eventArgs = {
        acceleration: { x: 0, y: 0, z: 0 },
        accelerationIncludingGravity: { x: 0, y: 0, z: 9.81 },
        rotationRate: { alpha: 0, beta: 0, gamma: 0 },
        interval: 16,
    };
    act(() => {
        fireEvent(window, new DeviceMotionEvent('devicemotion', eventArgs));
    });
    expect(result.current).toMatchObject(eventArgs);
});