
import { renderHook } from '@testing-library/react-hooks';
import { useCallback } from 'react';
import useAsync from '../src/hooks/useAsync';

describe('useAsync', () => {
  it('deve ser definido', () => {
    expect(useAsync).toBeDefined();
  });

  describe('um sucesso', () => {
    let hook;
    let callCount = 0;

    const resolver = async () => {
      return new Promise(resolve => {
        callCount++;

        const wait = setTimeout(() => {
          clearTimeout(wait);
          resolve('yay');
        }, 0);
      });
    };

    beforeEach(() => {
      callCount = 0;
      hook = renderHook(({ fn }) => useAsync(fn, [fn]), {
        initialProps: {
          fn: resolver,
        },
      });
    });

    it('inicialmente começa a carregar', async () => {
      expect(hook.result.current.loading).toEqual(true);
      await hook.waitForNextUpdate();
    });

    it('resolve', async () => {
      expect.assertions(4);

      hook.rerender({ fn: resolver });
      await hook.waitForNextUpdate();

      expect(callCount).toEqual(1);
      expect(hook.result.current.loading).toBeFalsy();
      expect(hook.result.current.value).toEqual('yay');
      expect(hook.result.current.error).toEqual(undefined);
    });
  });

  describe('um erro', () => {
    let hook;
    let callCount = 0;

    const rejection = async () => {
      return new Promise((_, reject) => {
        callCount++;

        const wait = setTimeout(() => {
          clearTimeout(wait);
          reject('yay');
        }, 0);
      });
    };

    beforeEach(() => {
      callCount = 0;
      hook = renderHook(({ fn }) => useAsync(fn, [fn]), {
        initialProps: {
          fn: rejection,
        },
      });
    });

    it('inicialmente começa a carregar', async () => {
      expect(hook.result.current.loading).toBeTruthy();
      await hook.waitForNextUpdate();
    });

    it('resolve', async () => {
      expect.assertions(4);

      hook.rerender({ fn: rejection });
      await hook.waitForNextUpdate();

      expect(callCount).toEqual(1);
      expect(hook.result.current.loading).toBeFalsy();
      expect(hook.result.current.error).toEqual('yay');
      expect(hook.result.current.value).toEqual(undefined);
    });
  });

  describe('reavalia quando as dependências mudam', () => {
    describe('the fn is a dependency', () => {
      let hook;
      let callCount = 0;

      const initialFn = async () => {
        callCount++;
        return 'value';
      };

      const differentFn = async () => {
        callCount++;
        return 'new value';
      };

      beforeEach(done => {
        callCount = 0;

        hook = renderHook(({ fn }) => useAsync(fn, [fn]), {
          initialProps: { fn: initialFn },
        });

        hook.waitForNextUpdate().then(done);
      });

      it('renderiza o primeiro valor', () => {
        expect(hook.result.current.value).toEqual('value');
      });

      it('renderiza um valor diferente quando as dependências mudam', async () => {
        expect.assertions(3);

        expect(callCount).toEqual(1);

        hook.rerender({ fn: differentFn }); // change the fn to initiate new request
        await hook.waitForNextUpdate();

        expect(callCount).toEqual(2);
        expect(hook.result.current.value).toEqual('new value');
      });
    });

    describe('a lista de dependências adicionais muda', () => {
      let callCount = 0;
      let hook;

      const staticFunction = async counter => {
        callCount++;
        return `counter is ${counter} and callCount is ${callCount}`;
      };

      beforeEach(done => {
        callCount = 0;
        hook = renderHook(
          ({ fn, counter }) => {
            const callback = useCallback(() => fn(counter), [counter]);
            return useAsync(callback, [callback]);
          },
          {
            initialProps: {
              counter: 0,
              fn: staticFunction,
            },
          }
        );

        hook.waitForNextUpdate().then(done);
      });

      it('inicial renderiza os primeiros pargs passados', () => {
        expect(hook.result.current.value).toEqual('counter is 0 and callCount is 1');
      });

      it('renderiza um valor diferente quando as dependências mudam', async () => {
        expect.assertions(1);

        hook.rerender({ fn: staticFunction, counter: 1 });
        await hook.waitForNextUpdate();

        expect(hook.result.current.value).toEqual('counter is 1 and callCount is 2');
      });
    });
  });
});
