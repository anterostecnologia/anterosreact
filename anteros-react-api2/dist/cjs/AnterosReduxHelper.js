"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDefaultReduxActions = exports.makeDefaultReduxObject = exports.initialState = exports.createReducer = void 0;
function createReducer(_initialState, _reducer) {
    return function (state = _initialState, action) {
        const reducer = _reducer;
        if ((reducer.hasOwnProperty(action.type) &&
            typeof reducer[action.type] === "function") ||
            typeof reducer[action.type] === "object") {
            const updated = typeof reducer[action.type] === "function"
                ? reducer[action.type](state, action.payload)
                : reducer[action.type];
            if (state instanceof Array) {
                return [...state, ...updated];
            }
            return Object.assign(Object.assign({}, state), updated);
        }
        return state;
    };
}
exports.createReducer = createReducer;
exports.initialState = {
    currentFilter: undefined,
    dataSource: undefined,
    activeFilterIndex: -1,
    needRefresh: false,
    needUpdateView: false,
};
function makeDefaultReduxObject(_reducerName) {
    return {
        [`SET_DATASOURCE_${_reducerName.toUpperCase()}`]: (state, payload) => (Object.assign(Object.assign({}, state), { dataSource: payload.dataSource, needRefresh: false })),
        [`SET_DATASOURCE_EDITION_${_reducerName.toUpperCase()}`]: (state, payload) => (Object.assign(Object.assign({}, state), { dataSource: payload.dataSource, needRefresh: false })),
        [`SET_FILTER_${_reducerName.toUpperCase()}`]: (state, payload) => (Object.assign(Object.assign({}, state), { currentFilter: payload.currentFilter, activeFilterIndex: payload.activeFilterIndex })),
        [`CLEAR_${_reducerName.toUpperCase()}`]: { initialState: exports.initialState },
        [`SET_${_reducerName.toUpperCase()}_NEEDREFRESH`]: (state, payload) => (Object.assign(Object.assign({}, state), { needRefresh: true })),
    };
}
exports.makeDefaultReduxObject = makeDefaultReduxObject;
function makeDefaultReduxActions(_actionName) {
    return {
        setDatasource(dataSource) {
            return {
                type: `SET_DATASOURCE_${_actionName}`,
                payload: {
                    dataSource,
                },
            };
        },
        setDatasourceEdition(dataSource) {
            return {
                type: `SET_DATASOURCE_EDITION_${_actionName}`,
                payload: {
                    dataSource,
                },
            };
        },
        setFilter(currentFilter, activeFilterIndex) {
            return {
                type: `SET_FILTER_${_actionName}`,
                payload: {
                    currentFilter,
                    activeFilterIndex,
                },
            };
        },
        clear() {
            return {
                type: `CLEAR_${_actionName}`,
                payload: {},
            };
        },
        setNeedRefresh() {
            return {
                type: `SET_${_actionName}_NEEDREFRESH`,
                payload: {
                    needRefresh: true,
                },
            };
        },
    };
}
exports.makeDefaultReduxActions = makeDefaultReduxActions;
//# sourceMappingURL=AnterosReduxHelper.js.map