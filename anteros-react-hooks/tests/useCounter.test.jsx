import { act, renderHook } from '@testing-library/react-hooks';
import useCounter from '../src/hooks/useCounter';

const setUp = (initialValue, max= null, min = null) =>
  renderHook(() => useCounter(initialValue, max, min));

it('deve init counter e utils', () => {
  const { result } = setUp(5);

  expect(result.current[0]).toBe(5);
  expect(result.current[1]).toStrictEqual({
    inc: expect.any(Function),
    dec: expect.any(Function),
    get: expect.any(Function),
    set: expect.any(Function),
    reset: expect.any(Function),
  });
});

it('deve init contador para 0 se não for o valor inicial recebido', () => {
  const { result } = setUp();

  expect(result.current[0]).toBe(0);
});

it('deve o init contar com um número negativo', () => {
  const { result } = setUp(-2);

  expect(result.current[0]).toBe(-2);
});

it('deve obter o contador atual', () => {
  const { result } = setUp(5);
  const { get } = result.current[1];

  expect(get()).toBe(5);
});

it('deve aumentar em 1 se não for recebido valor', () => {
  const { result } = setUp(5);
  const { get, inc } = result.current[1];

  act(() => inc());

  expect(result.current[0]).toBe(6);
  expect(get()).toBe(6);
});

it('deve incrementar pelo valor recebido', () => {
  const { result } = setUp(5);
  const { get, inc } = result.current[1];

  act(() => inc(9));

  expect(result.current[0]).toBe(14);
  expect(get()).toBe(14);
});

it('deve diminuir em 1 se o valor não for recebido', () => {
  const { result } = setUp(5);
  const { get, dec } = result.current[1];

  act(() => dec());

  expect(result.current[0]).toBe(4);
  expect(get()).toBe(4);
});

it('deve diminuir por valor recebido', () => {
  const { result } = setUp(5);
  const { get, dec } = result.current[1];

  act(() => dec(9));

  expect(result.current[0]).toBe(-4);
  expect(get()).toBe(-4);
});

it('deve definir para o valor recebido', () => {
  const { result } = setUp(5);
  const { get, set } = result.current[1];

  act(() => set(17));

  expect(result.current[0]).toBe(17);
  expect(get()).toBe(17);
});

it('deve redefinir para o valor original', () => {
  const { result } = setUp(5);
  const { get, set, reset } = result.current[1];

  // define um valor diferente do inicial ...
  act(() => set(17));
  expect(result.current[0]).toBe(17);

  // ... e redefina-o para o inicial
  act(() => reset());
  expect(result.current[0]).toBe(5);
  expect(get()).toBe(5);
});

it('deve redefinir e definir um novo valor original', () => {
  const { result } = setUp(5);
  const { get, set, reset } = result.current[1];

  // define um valor diferente do inicial ...
  act(() => set(17));
  expect(result.current[0]).toBe(17);

  // ... agora redefina e configure-o para diferente do inicial ...
  act(() => reset(8));
  expect(result.current[0]).toBe(8);

  // ... e definir um valor diferente do inicial novamente ...
  act(() => set(32));
  expect(result.current[0]).toBe(32);

  // ... e redefina-o para o novo valor inicial
  act(() => reset());
  expect(result.current[0]).toBe(8);
  expect(get()).toBe(8);
});

it('não deve exceder o valor máximo', () => {
  const { result } = setUp(10, 5);
  expect(result.current[0]).toBe(5);

  const { get, inc, reset } = result.current[1];

  act(() => reset(10));
  expect(get()).toBe(5);

  act(() => reset(4));
  expect(get()).toBe(4);

  act(() => inc());
  expect(get()).toBe(5);

  act(() => inc());
  expect(get()).toBe(5);
});

it('should not exceed min value', () => {
  const { result } = setUp(3, null, 5);
  expect(result.current[0]).toBe(5);

  const { get, dec, reset } = result.current[1];

  act(() => reset(4));
  expect(get()).toBe(5);

  act(() => reset(6));
  expect(get()).toBe(6);

  act(() => dec());
  expect(get()).toBe(5);

  act(() => dec());
  expect(get()).toBe(5);
});

describe('deve `console.error` em entradas inesperadas', () => {
  it('em qualquer um dos parâmetros de chamada', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // @ts-ignore
    setUp(false);
    expect(spy.mock.calls[0][0]).toBe('initialValue has to be a number, got boolean');

    // @ts-ignore
    setUp(10, false);
    expect(spy.mock.calls[1][0]).toBe('max has to be a number, got boolean');

    // @ts-ignore
    setUp(10, 5, {});
    expect(spy.mock.calls[2][0]).toBe('min has to be a number, got object');

    spy.mockRestore();
  });

  it('em qualquer um dos métodos retornados tem uma entrada inesperada', () => {
    const { result } = setUp(10);
    const { inc, dec, reset } = result.current[1];

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // @ts-ignore
    act(() => inc(false));
    expect(spy.mock.calls[0][0]).toBe('delta has to be a number or function returning a number, got boolean');

    // @ts-ignore
    act(() => dec(false));
    expect(spy.mock.calls[1][0]).toBe('delta has to be a number or function returning a number, got boolean');

    // @ts-ignore
    act(() => reset({}));
    expect(spy.mock.calls[2][0]).toBe('value has to be a number or function returning a number, got object');

    spy.mockRestore();
  });
});
