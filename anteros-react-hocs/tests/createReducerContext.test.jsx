import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import createReducerContext from '../src/hooks/createReducerContext';

const reducer = (state, action) => {
  switch (action) {
    case 'increment':
      return state + 1;
    case 'decrement':
      return state - 1;
    default:
      throw new Error();
  }
};


it('deve criar um hook e um provedor', () => {
  const [useSharedNumber, SharedNumberProvider] = createReducerContext(reducer, 0);
  expect(useSharedNumber).toBeInstanceOf(Function);
  expect(SharedNumberProvider).toBeInstanceOf(Function);
});

describe('ao usar o hook criado', () => {
  it('deve jogar fora de um provedor', () => {
    const [useSharedNumber] = createReducerContext(reducer, 0);
    const { result } = renderHook(() => useSharedNumber());
    expect(result.error).toEqual(new Error('useReducerContext must be used inside a ReducerProvider.'));
  });

  const setUp = () => {
    const [useSharedNumber, SharedNumberProvider] = createReducerContext(reducer, 0);
    const wrapper = ({ children }) => <SharedNumberProvider>{children}</SharedNumberProvider>;
    return renderHook(() => useSharedNumber(), { wrapper });
  };

  it('deve init state e atualizador', () => {
    const { result } = setUp();
    const [sharedNumber, updateSharedNumber] = result.current;

    expect(sharedNumber).toEqual(0);
    expect(updateSharedNumber).toBeInstanceOf(Function);
  });

  it('deve atualizar o estado', () => {
    const { result } = setUp();
    const [, updateSharedNumber] = result.current;

    act(() => updateSharedNumber('increment'));

    const [sharedNumber] = result.current;

    expect(sharedNumber).toEqual(1);
  });
});

describe('ao usar entre vários componentes', () => {
  const [useSharedNumber, SharedNumberProvider] = createReducerContext(reducer, 0);

  const DisplayComponent = () => {
    const [sharedNumber] = useSharedNumber();
    return <p>{sharedNumber}</p>;
  };

  const UpdateComponent = () => {
    const [, updateSharedNumber] = useSharedNumber();
    return (
      <button type="button" onClick={() => updateSharedNumber('increment')}>
        INCREMENT
      </button>
    );
  };

  it('deve estar em sincronia quando sob o mesmo provedor', () => {
    const { baseElement, getByText } = render(
      <SharedNumberProvider>
        <DisplayComponent />
        <DisplayComponent />
        <UpdateComponent />
      </SharedNumberProvider>
    );

    expect(baseElement.innerHTML).toBe('<div><p>0</p><p>0</p><button type="button">INCREMENT</button></div>');

    fireEvent.click(getByText('INCREMENT'));

    expect(baseElement.innerHTML).toBe('<div><p>1</p><p>1</p><button type="button">INCREMENT</button></div>');
  });

  it('deve estar em atualização de forma independente quando sob diferentes provedores', () => {
    const { baseElement, getByText } = render(
      <>
        <SharedNumberProvider>
          <DisplayComponent />
        </SharedNumberProvider>
        <SharedNumberProvider>
          <DisplayComponent />
          <UpdateComponent />
        </SharedNumberProvider>
      </>
    );

    expect(baseElement.innerHTML).toBe('<div><p>0</p><p>0</p><button type="button">INCREMENT</button></div>');

    fireEvent.click(getByText('INCREMENT'));

    expect(baseElement.innerHTML).toBe('<div><p>0</p><p>1</p><button type="button">INCREMENT</button></div>');
  });

  it('não deve atualizar componentes que não usam o contexto de estado', () => {
    let renderCount = 0;
    const StaticComponent = () => {
      renderCount++;
      return <p>static</p>;
    };

    const { baseElement, getByText } = render(
      <>
        <SharedNumberProvider>
          <StaticComponent />
          <DisplayComponent />
          <UpdateComponent />
        </SharedNumberProvider>
      </>
    );

    expect(baseElement.innerHTML).toBe('<div><p>static</p><p>0</p><button type="button">INCREMENT</button></div>');

    fireEvent.click(getByText('INCREMENT'));

    expect(baseElement.innerHTML).toBe('<div><p>static</p><p>1</p><button type="button">INCREMENT</button></div>');

    expect(renderCount).toBe(1);
  });

  it('deve substituir initialValue', () => {
    const { baseElement } = render(
      <>
        <SharedNumberProvider>
          <DisplayComponent />
        </SharedNumberProvider>
        <SharedNumberProvider initialState={15}>
          <DisplayComponent />
        </SharedNumberProvider>
      </>
    );

    expect(baseElement.innerHTML).toBe('<div><p>0</p><p>15</p></div>');
  });
});