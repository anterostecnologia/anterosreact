import { act, renderHook } from '@testing-library/react-hooks';
import useAsyncFn from '../src/hooks/useAsyncFn';
describe('useAsyncFn', () => {
    it('deve ser definido', () => {
        expect(useAsyncFn).toBeDefined();
    });
    describe('o retorno de chamada pode ser aguardado e retornar o valor', () => {
        let hook;
        const adder = async (a, b) => {
            return (a || 0) + (b || 0);
        };
        beforeEach(() => {
            // NOTA: renderHook não é bom em inferir tipos de array
            hook = renderHook(({ fn }) => useAsyncFn(fn), {
                initialProps: { fn: adder },
            });
        });
        it('resultado esperado', async () => {
            expect.assertions(3);
            const [, callback] = hook.result.current;
            let result;
            await act(async () => {
                result = await callback(5, 7);
            });
            expect(result).toEqual(12);
            const [state] = hook.result.current;
            expect(state.value).toEqual(12);
            expect(result).toEqual(state.value);
        });
    });
    describe('args podem ser passados ​​para a função', () => {
        let hook;
        let callCount = 0;
        const adder = async (a, b) => {
            callCount++;
            return (a || 0) + (b || 0);
        };
        beforeEach(() => {
            // NOTA: renderHook não é bom em inferir tipos de array
            hook = renderHook(({ fn }) => useAsyncFn(fn), {
                initialProps: {
                    fn: adder,
                },
            });
        });
        it('inicialmente não tem um valor', () => {
            const [state] = hook.result.current;
            expect(state.value).toEqual(undefined);
            expect(state.loading).toEqual(false);
            expect(state.error).toEqual(undefined);
            expect(callCount).toEqual(0);
        });
        describe('quando invocado', () => {
            it('resolve um valor derivado de args', async () => {
                expect.assertions(4);
                const [, callback] = hook.result.current;
                act(() => {
                    callback(2, 7);
                });
                hook.rerender({ fn: adder });
                await hook.waitForNextUpdate();
                const [state] = hook.result.current;
                expect(callCount).toEqual(1);
                expect(state.loading).toEqual(false);
                expect(state.error).toEqual(undefined);
                expect(state.value).toEqual(9);
            });
        });
    });
    it('deve apenas considerar a última chamada e descartar as anteriores', async () => {
        const queuedPromises = [];
        const delayedFunction1 = () => {
            return new Promise(resolve => queuedPromises.push({ id: 1, resolve: () => resolve(1) }));
        };
        const delayedFunction2 = () => {
            return new Promise(resolve => queuedPromises.push({ id: 2, resolve: () => resolve(2) }));
        };
        const hook = renderHook(({ fn }) => useAsyncFn(fn, [fn]), {
            initialProps: { fn: delayedFunction1 },
        });
        act(() => {
            hook.result.current[1](); // invocar o primeiro retorno de chamada
        });
        hook.rerender({ fn: delayedFunction2 });
        act(() => {
            hook.result.current[1](); // invocar o segundo retorno de chamada
        });
        act(() => {
            queuedPromises[1].resolve();
            queuedPromises[0].resolve();
        });
        await hook.waitForNextUpdate();
        expect(hook.result.current[0]).toEqual({ loading: false, value: 2 });
    });
    it('deve manter o valor de initialState ao carregar', async () => {
        const fetch = async () => 'new state';
        const initialState = { loading: false, value: 'init state' };
        const hook = renderHook(({ fn }) => useAsyncFn(fn, [fn], initialState), {
            initialProps: { fn: fetch },
        });
        const [state, callback] = hook.result.current;
        expect(state.loading).toBe(false);
        expect(state.value).toBe('init state');
        act(() => {
            callback();
        });
        expect(hook.result.current[0].loading).toBe(true);
        expect(hook.result.current[0].value).toBe('init state');
        await hook.waitForNextUpdate();
        expect(hook.result.current[0].loading).toBe(false);
        expect(hook.result.current[0].value).toBe('new state');
    });
});