import { fireEvent } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import useLanguagePreferences from '../src/hooks/useLanguagePreferences';

test('change preferred languages', () => {
  debugger
  const { result } = renderHook(() => useLanguagePreferences()); 
  expect(result.current).toEqual(['en-US', 'en']);

  act(() => {
    Object.defineProperty(navigator, 'languages', {
      value: ['pt-BR','pt','hu-HU', 'hu', 'en-US', 'en'],
    });
    fireEvent(window, new Event('languagechange'));
  });
  expect(result.current).toEqual(['pt-BR','pt','hu-HU', 'hu', 'en-US', 'en']);
});
