import { fireEvent } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import useWindowSize  from '../src/hooks/useWindowSize2';

test('change window size', () => {
  const { result } = renderHook(() => useWindowSize());
  expect(result.current).toEqual([1024, 768]);

  act(() => {
    window.innerWidth = 1920;
    window.innerHeight = 1080;
    fireEvent(window, new UIEvent('resize'));
  });
  expect(result.current).toEqual([1920, 1080]);
});
