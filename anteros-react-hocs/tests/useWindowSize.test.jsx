import { act, renderHook } from '@testing-library/react-hooks';
import { replaceRaf } from 'raf-stub';
import useWindowSize from '../src/hooks/useWindowSize';
import { isClient } from '../src/hooks/util';
describe('useWindowSize', () => {
    beforeAll(() => {
        replaceRaf();
    });
    afterEach(() => {
        window.requestAnimationFrame.reset();
    });
    it('should be defined', () => {
        expect(useWindowSize).toBeDefined();
    });
    function getHook(...args) {
        return renderHook(() => useWindowSize(...args));
    }
    function triggerResize(dimension, value) {
        if (dimension === 'width') {
            window.innerWidth = value;
        }
        else if (dimension === 'height') {
            window.innerHeight = value;
        }
        window.dispatchEvent(new Event('resize'));
    }
    it('should return current window dimensions', () => {
        const hook = getHook();
        expect(typeof hook.result.current).toBe('object');
        expect(typeof hook.result.current.height).toBe('number');
        expect(typeof hook.result.current.width).toBe('number');
    });
    it('should use passed parameters as initial values in case of non-browser use', () => {
        const hook = getHook(1, 1);
        expect(hook.result.current.height).toBe(isClient ? window.innerHeight : 1);
        expect(hook.result.current.width).toBe(isClient ? window.innerWidth : 1);
    });
    it('should re-render after height change on closest RAF', () => {
        const hook = getHook();
        act(() => {
            triggerResize('height', 360);
            window.requestAnimationFrame.step();
        });
        expect(hook.result.current.height).toBe(360);
        act(() => {
            triggerResize('height', 2048);
            window.requestAnimationFrame.step();
        });
        expect(hook.result.current.height).toBe(2048);
    });
    it('should re-render after width change on closest RAF', () => {
        const hook = getHook();
        act(() => {
            triggerResize('width', 360);
            window.requestAnimationFrame.step();
        });
        expect(hook.result.current.width).toBe(360);
        act(() => {
            triggerResize('width', 2048);
            window.requestAnimationFrame.step();
        });
        expect(hook.result.current.width).toBe(2048);
    });
});