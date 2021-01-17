import { act, renderHook } from '@testing-library/react-hooks';
import createGlobalState from '../src/hooks/createGlobalState';

describe('useGlobalState', () => {
  it('deve ser definido', () => {
    expect(createGlobalState).toBeDefined();
  });

  it('ambos os componentes devem ser atualizados', () => {
    const useGlobalValue = createGlobalState(0);
    const { result: result1 } = renderHook(() => useGlobalValue());
    const { result: result2 } = renderHook(() => useGlobalValue());
    expect(result1.current[0] === 0);
    expect(result2.current[0] === 0);
    act(() => {
      result1.current[1](1);
    });
    expect(result1.current[0] === 1);
    expect(result2.current[0] === 1);
  });
});
