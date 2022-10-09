/**
 * createReducer
 *
 * @param {object} _initialState
 * @param {object} _reducer
 *
 * Exemplo _initialState:
 * const initState = {
 *  a: 2,
 *  b: 3,
 *  c: 4,
 *  d: 5
 * }
 *
 * Exemplo _reducer:
 * const reducerObj = {
 *  [ADD_TO_A]: (prevState, payload) => ({ a: prevState.a + payload }),
 *  [POWER_OF_B]: (prevState) => ({ b: prevState.b * prevState.b }),
 *  [C_IS_TWELVE]: { c: 12 }
 * }
 *
 * ADD_TO_A, POWER_OF_B, C_IS_TWELVE is a constant type, action type.
 *
 * reducerObj deve ser um objeto com cada valor de sua propriedade é uma função ou um objeto simples
 * createReducer irá corresponder
 * Se for uma função, receberá 2 parâmetros, prevState e carga útil.
 * Você pode acessar seu estado anterior por meio de prevState, primeiro parâmetro.
 * Acesse também a carga útil do objeto despachado via carga útil
 * É prevState e carga útil da ação.
 *
 * Preste atenção para que você não precise espalhar e retornar o estado anterior novamente
 * Isso será tratado pela função.
 * Basta alterar o valor de qual estado você deseja atualizar.
 *
 * Se você decidir fazer algum tipo de mágica no redutorObj vá em frente e personalize sua função
 * exemplo:
 * const reducerObj = {
 *  [DO_SOME_MAGIC_TO_A]: (prevState, payload) => {
 *    // faça alguma mágica complexa
 *    return { a: 9999 }
 *  },
 *  // ... outro manipulador
 * }
 *
 * Uso:
 * const rootReducer = combineReducers({
 *  MyReducer: createReducer(initState, reducerObj)
 * })
 *
 * createReducer é apenas uma função de alta ordem que retornará uma função com parâmetro de estado e ação,
 * apenas como redutor normal. Portanto, você não precisa recodificar cada caso de switch ou espalhar seu estado anterior em todas as ações possíveis.
 */
export declare function createReducer(_initialState: any, _reducer: any): (state: any, action: any) => any;
export declare const initialState: {
    currentFilter: undefined;
    dataSource: undefined;
    activeFilterIndex: number;
    needRefresh: boolean;
    needUpdateView: boolean;
};
export declare function makeDefaultReduxObject(_reducerName: any): {
    [x: string]: ((state: any, payload: any) => any) | {
        initialState: {
            currentFilter: undefined;
            dataSource: undefined;
            activeFilterIndex: number;
            needRefresh: boolean;
            needUpdateView: boolean;
        };
    };
};
export declare function makeDefaultReduxActions(_actionName: any): {
    setDatasource(dataSource: any): {
        type: string;
        payload: {
            dataSource: any;
        };
    };
    setDatasourceEdition(dataSource: any): {
        type: string;
        payload: {
            dataSource: any;
        };
    };
    setFilter(currentFilter: any, activeFilterIndex: any): {
        type: string;
        payload: {
            currentFilter: any;
            activeFilterIndex: any;
        };
    };
    clear(): {
        type: string;
        payload: {};
    };
    setNeedRefresh(): {
        type: string;
        payload: {
            needRefresh: boolean;
        };
    };
};
