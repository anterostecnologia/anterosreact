import { fireEvent } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import useWindowScrollCoords  from '../src/hooks/useWindowScrollCoords';

test('change window scroll coords', () => {
  const { result } = renderHook(() => useWindowScrollCoords());
  expect(result.current).toEqual([0, 0]);

  act(() => {
    window.pageXOffset = 11;
    window.pageYOffset = 22;
    fireEvent.scroll(window);
  });
  expect(result.current).toEqual([11, 22]);
});
