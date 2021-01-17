import { scrollbarWidth } from '@xobotyi/scrollbar-width';
import { useScrollbarWidth } from '../src/hooks/useScrollbarWidth';
import { replaceRaf } from 'raf-stub';
import { renderHook, act } from '@testing-library/react-hooks';

window.requestAnimationFrame=undefined;
describe('useScrollbarWidth', () => {
    beforeAll(() => {
        replaceRaf();
    });
    afterEach(() => {
        window.requestAnimationFrame.reset();
    });
    it('should be defined', () => {
        expect(useScrollbarWidth).toBeDefined();
    });
    it('should return value of scrollbarWidth result', () => {
        scrollbarWidth.__cache = 21;
        const { result } = renderHook(() => useScrollbarWidth());
        expect(result.current).toBe(21);
    });
    it('should re-call scrollbar width in RAF in case `scrollbarWidth()` returned undefined', () => {
        scrollbarWidth.__cache = undefined;
        const { result } = renderHook(() => useScrollbarWidth());
        expect(result.current).toBe(undefined);
        scrollbarWidth.__cache = 34;
        act(() => {
            window.requestAnimationFrame.step();
        });
        expect(result.current).toBe(34);
    });
});