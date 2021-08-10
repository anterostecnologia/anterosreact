import { resolveHookState } from '../src/util/resolveHookState';

describe('resolveHookState', () => {
  it('deve ser definido', () => {
    expect(resolveHookState).toBeDefined();
  });

  it(`deve retornar o valor como está, se não for uma função`, () => {
    expect(resolveHookState(1)).toBe(1);
    expect(resolveHookState('HI!')).toBe('HI!');
    expect(resolveHookState(undefined)).toBe(undefined);
  });

  it('deve chamar a função passada', () => {
    const spy = jest.fn();
    resolveHookState(spy);
    expect(spy).toHaveBeenCalled();
  });

  it('deve passar o segundo parâmetro para funcionar', () => {
    const spy = jest.fn();
    resolveHookState(spy, 123);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toBe(123);
  });
});
