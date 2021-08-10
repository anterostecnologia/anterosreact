import { renderHook } from '@testing-library/react-hooks';
import createMemo from '../src/hooks/createMemo';

const getDouble = jest.fn((n) => n * 2);

window.useMemoGetDouble=undefined;

it('deve iniciar memo hook ', () => {
  window.useMemoGetDouble = createMemo(getDouble);

  expect(useMemoGetDouble).toBeInstanceOf(Function);
});

describe('ao usar criado memo hook', () => {

  beforeEach(() => {
    window.useMemoGetDouble = createMemo(getDouble);
  });

  it.each([[1], [3], [5]])('should return same result as original function for argument %d', (val) => {
    const { result } = renderHook(() => window.useMemoGetDouble(val));
    expect(result.current).toBe(getDouble(val));
  });

  it('NÃO deve chamar a função original para os mesmos argumentos', () => {
    let initialValue = 5;
    expect(getDouble).not.toHaveBeenCalled();

    // it's called first time calculating for argument 5
    const { rerender } = renderHook(() => window.useMemoGetDouble(initialValue));
    expect(getDouble).toHaveBeenCalled();

    getDouble.mockClear();

    // NÃO é chamado de cálculo da segunda vez para o argumento 5
    rerender();
    expect(getDouble).not.toHaveBeenCalled();

    getDouble.mockClear();

    // é chamado novamente calculando para diferentes argumentos
    initialValue = 7;
    rerender();
    expect(getDouble).toHaveBeenCalled();
  });
});
