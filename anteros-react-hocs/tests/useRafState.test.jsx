import { act, renderHook } from '@testing-library/react-hooks';
import { replaceRaf } from 'raf-stub';
import useRafState from '../src/hooks/useRafState';

var requestAnimationFrame;

replaceRaf();

beforeEach(() => {
  window.requestAnimationFrame.reset();
});

afterEach(() => {
  window.requestAnimationFrame.reset();
});

describe('useRafState', () => {
  it('should be defined', () => {
    expect(useRafState).toBeDefined();
  });

  it('should only update state after requestAnimationFrame when providing an object', () => {
    const { result } = renderHook(() => useRafState(0));

    act(() => {
      result.current[1](1);
    });
    expect(result.current[0]).toBe(0);

    act(() => {
      window.requestAnimationFrame.step();
    });
    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1](2);
      window.requestAnimationFrame.step();
    });
    expect(result.current[0]).toBe(2);

    act(() => {
      result.current[1](prevState => prevState * 2);
      window.requestAnimationFrame.step();
    });
    expect(result.current[0]).toBe(4);
  });

  it('should only update state after requestAnimationFrame when providing a function', () => {
    const { result } = renderHook(() => useRafState(0));

    act(() => {
      result.current[1](prevState => prevState + 1);
    });
    expect(result.current[0]).toBe(0);

    act(() => {
      window.requestAnimationFrame.step();
    });
    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1](prevState => prevState * 3);
      window.requestAnimationFrame.step();
    });
    expect(result.current[0]).toBe(3);
  });

  it('should cancel update state on unmount', () => {
    const { unmount } = renderHook(() => useRafState(0));
    const spyRafCancel = jest.spyOn(global, 'cancelAnimationFrame');

    expect(spyRafCancel).not.toHaveBeenCalled();

    unmount();

    expect(spyRafCancel).toHaveBeenCalledTimes(1);
  });
});
