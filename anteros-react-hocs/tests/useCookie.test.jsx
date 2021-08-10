import { renderHook, act } from '@testing-library/react-hooks';
import Cookies from 'js-cookie';
import useCookie from '../src/hooks/useCookie';

const setup = (cookieName) => renderHook(() => useCookie(cookieName));

it('deve ter valor inicial nulo se não houver cookie', () => {
  const { result } = setup('some-cookie');

  expect(result.current[0]).toBeNull();
});

it('deve ter o valor inicial do cookie se ele existir', () => {
  const cookieName = 'some-cookie';
  const value = 'some-value';
  Cookies.set(cookieName, value);

  const { result } = setup(cookieName);

  expect(result.current[0]).toBe(value);

  // Limpar
  Cookies.remove(cookieName);
});

it('deve atualizar o cookie de plantão para updateCookie', () => {
  const spy = jest.spyOn(Cookies, 'set');

  const cookieName = 'some-cookie';
  const { result } = setup(cookieName);

  const newValue = 'some-new-value';
  act(() => {
    result.current[1](newValue);
  });

  expect(result.current[0]).toBe(newValue);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(cookieName, newValue, undefined);

  // Limpar
  spy.mockRestore();
  Cookies.remove(cookieName);
});

it('deve deletar o cookie de plantão para deleteCookie', () => {
  const cookieName = 'some-cookie';
  const value = 'some-value';
  Cookies.set(cookieName, value);

  const spy = jest.spyOn(Cookies, 'remove');

  const { result } = setup(cookieName);

  expect(result.current[0]).toBe(value);

  act(() => {
    result.current[2]();
  });

  expect(result.current[0]).toBeNull();
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenLastCalledWith(cookieName);

  // cleanup
  spy.mockRestore();
  Cookies.remove(cookieName);
});
