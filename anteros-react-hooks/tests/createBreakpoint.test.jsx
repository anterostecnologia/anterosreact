import { act, renderHook } from '@testing-library/react-hooks';
import createBreakpoint from '../src/hooks/createBreakpoint';
const useBreakpointA = createBreakpoint();
const useBreakpointB = createBreakpoint({ mobileM: 350, laptop: 1024, tablet: 768 });
const originalInnerWidth = window.innerWidth;
const changeInnerWidth = value => Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value });
const revert = () => changeInnerWidth(originalInnerWidth);
describe('createBreakpoint', () => {
    test('deve usar padrão', () => {
        const { result } = renderHook(() => useBreakpointA());
        act(() => {
            changeInnerWidth(100);
            window.dispatchEvent(new Event('resize'));
        });
        expect(result.current).toBe('tablet');
        act(() => {
            changeInnerWidth(200);
            window.dispatchEvent(new Event('resize'));
        });
        expect(result.current).toBe('tablet');
        act(() => {
            changeInnerWidth(1100);
            window.dispatchEvent(new Event('resize'));
        });
        expect(result.current).toBe('laptop');
        act(() => {
            changeInnerWidth(1500);
            window.dispatchEvent(new Event('resize'));
        });
        expect(result.current).toBe('laptopL');
        act(() => {
            revert();
        });
    });
    test('deve usar costumizado', () => {
        const { result } = renderHook(() => useBreakpointB());
        act(() => {
            changeInnerWidth(100);
            window.dispatchEvent(new Event('resize'));
        });
        expect(result.current).toBe('mobileM');
        act(() => {
            changeInnerWidth(200);
            window.dispatchEvent(new Event('resize'));
        });
        expect(result.current).toBe('mobileM');
        act(() => {
            changeInnerWidth(800);
            window.dispatchEvent(new Event('resize'));
        });
        expect(result.current).toBe('tablet');
        act(() => {
            changeInnerWidth(1100);
            window.dispatchEvent(new Event('resize'));
        });
        expect(result.current).toBe('laptop');
        act(() => {
            revert();
        });
    });
});