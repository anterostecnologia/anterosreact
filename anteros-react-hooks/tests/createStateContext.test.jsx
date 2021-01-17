import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import createStateContext from '../src/hooks/createStateContext';

it('deve criar um hook e um provedor', () => {
  const [useSharedNumber, SharedNumberProvider] = createStateContext(0);
  expect(useSharedNumber).toBeInstanceOf(Function);
  expect(SharedNumberProvider).toBeInstanceOf(Function);
});

describe('usar ao criar um hook', () => {
  it('deve jogar fora de um provedor', () => {
    const [useSharedText] = createStateContext('init');
    const { result } = renderHook(() => useSharedText());
    expect(result.error).toEqual(new Error('useStateContext must be used inside a StateProvider.'));
  });

  const setUp = () => {
    const [useSharedText, SharedTextProvider] = createStateContext('init');
    const wrapper = ({ children }) => <SharedTextProvider>{children}</SharedTextProvider>;
    return renderHook(() => useSharedText(), { wrapper });
  };

  it('deve inicializar state e atualizador', () => {
    const { result } = setUp();
    const [sharedText, setSharedText] = result.current;

    expect(sharedText).toEqual('init');
    expect(setSharedText).toBeInstanceOf(Function);
  });

  it('deve atualizar o state', () => {
    const { result } = setUp();
    const [, setSharedText] = result.current;

    act(() => setSharedText('changed'));

    const [sharedText] = result.current;

    expect(sharedText).toEqual('changed');
  });
});

describe('ao usar entre vários componentes', () => {
  const [useSharedText, SharedTextProvider] = createStateContext('init');

  const DisplayComponent = () => {
    const [sharedText] = useSharedText();
    return <p>{sharedText}</p>;
  };

  const UpdateComponent = () => {
    const [, setSharedText] = useSharedText();
    return (
      <button type="button" onClick={() => setSharedText('changed')}>
        UPDATE
      </button>
    );
  };

  it('deve estar em sincronia quando sob o mesmo provedor', () => {
    const { baseElement, getByText } = render(
      <SharedTextProvider>
        <DisplayComponent />
        <DisplayComponent />
        <UpdateComponent />
      </SharedTextProvider>
    );

    expect(baseElement.innerHTML).toBe('<div><p>init</p><p>init</p><button type="button">UPDATE</button></div>');

    fireEvent.click(getByText('UPDATE'));

    expect(baseElement.innerHTML).toBe('<div><p>changed</p><p>changed</p><button type="button">UPDATE</button></div>');
  });

  it('deve estar em atualização de forma independente quando sob diferentes provedores', () => {
    const { baseElement, getByText } = render(
      <>
        <SharedTextProvider>
          <DisplayComponent />
        </SharedTextProvider>
        <SharedTextProvider>
          <DisplayComponent />
          <UpdateComponent />
        </SharedTextProvider>
      </>
    );

    expect(baseElement.innerHTML).toBe('<div><p>init</p><p>init</p><button type="button">UPDATE</button></div>');

    fireEvent.click(getByText('UPDATE'));

    expect(baseElement.innerHTML).toBe('<div><p>init</p><p>changed</p><button type="button">UPDATE</button></div>');
  });

  it('should not update component that do not use the state context', () => {
    let renderCount = 0;
    const StaticComponent = () => {
      renderCount++;
      return <p>static</p>;
    };

    const { baseElement, getByText } = render(
      <>
        <SharedTextProvider>
          <StaticComponent />
          <DisplayComponent />
          <UpdateComponent />
        </SharedTextProvider>
      </>
    );

    expect(baseElement.innerHTML).toBe('<div><p>static</p><p>init</p><button type="button">UPDATE</button></div>');

    fireEvent.click(getByText('UPDATE'));

    expect(baseElement.innerHTML).toBe('<div><p>static</p><p>changed</p><button type="button">UPDATE</button></div>');

    expect(renderCount).toBe(1);
  });

  it('deve substituir initialValue', () => {
    const { baseElement } = render(
      <>
        <SharedTextProvider>
          <DisplayComponent />
        </SharedTextProvider>
        <SharedTextProvider initialValue={'other'}>
          <DisplayComponent />
        </SharedTextProvider>
      </>
    );

    expect(baseElement.innerHTML).toBe('<div><p>init</p><p>other</p></div>');
  });
});
