(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("@anterostecnologia/anteros-react-api2", [], factory);
	else if(typeof exports === 'object')
		exports["@anterostecnologia/anteros-react-api2"] = factory();
	else
		root["@anterostecnologia/anteros-react-api2"] = factory();
})(typeof self !== 'undefined' ? self : this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/AnterosEntity.ts":
/*!******************************!*\
  !*** ./src/AnterosEntity.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosEntity = void 0;
class AnterosEntity {
    constructor(id) {
        this._id = id;
    }
    /**
     * Getter id
     * @return {any}
     */
    get id() {
        return this._id;
    }
    /**
     * Setter id
     * @param {any} value
     */
    set id(value) {
        this._id = value;
    }
}
exports.AnterosEntity = AnterosEntity;


/***/ }),

/***/ "./src/AnterosErrorMessageHelper.ts":
/*!******************************************!*\
  !*** ./src/AnterosErrorMessageHelper.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.processDetailErrorMessage = exports.processErrorMessage = void 0;
function processErrorMessage(error) {
    var msgErro = "";
    if (error.response && error.response.data && error.response.data.apierror) {
        msgErro = error.response.data.apierror.message;
        if (error.response.data.apierror.subErrors) {
            msgErro = [];
            error.response.data.apierror.subErrors.forEach((element) => {
                msgErro.push(element.message + " (" + element.object + ")");
            });
        }
    }
    else {
        if (error.response &&
            error.response.status &&
            error.response.status === 404) {
            msgErro =
                "Recurso não encontrado no servidor ou a url está incorreta. Erro 404";
        }
        else if (error.response &&
            error.response.status &&
            error.response.status === 401) {
            msgErro = "Usuário/senha inválido.";
        }
        else if (error.response &&
            error.response.status &&
            error.response.status === 405) {
            msgErro =
                "Método não permitido no servidor ou a url está incorreta. Erro 405";
        }
        else if (error.response &&
            error.response.status &&
            error.response.status === 400) {
            msgErro = "Requisição incorreta. Erro 400";
        }
        else if (error.response && error.response.data) {
            msgErro = error.response.data;
        }
        else if (error.response) {
            msgErro = error.response;
        }
        else {
            if (error.message && error.message === "Network Error") {
                msgErro = "Servidor não disponível ou algum problema na rede.";
            }
            else {
                msgErro = error.message ? error.message : error;
            }
        }
    }
    if (typeof msgErro === "object") {
        if (error &&
            (error.code === "ERR_NETWORK" || error.message === "Network Error")) {
            msgErro = "Servidor não disponível ou algum problema na rede.";
        }
    }
    return msgErro + "";
}
exports.processErrorMessage = processErrorMessage;
function processDetailErrorMessage(error) {
    var msgErro = "";
    if (error.response && error.response.data && error.response.data.apierror) {
        msgErro = error.response.data.apierror.debugMessage;
    }
    return msgErro + "";
}
exports.processDetailErrorMessage = processDetailErrorMessage;


/***/ }),

/***/ "./src/AnterosReduxHelper.ts":
/*!***********************************!*\
  !*** ./src/AnterosReduxHelper.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
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


/***/ }),

/***/ "./src/AnterosRemoteApi.ts":
/*!*********************************!*\
  !*** ./src/AnterosRemoteApi.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosAxiosApiClient = exports.DatasourceApiAdapter = exports.ApiConfiguration = void 0;
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "axios"));
__webpack_require__(/*! regenerator-runtime/runtime */ "regenerator-runtime/runtime");
const AnterosErrorMessageHelper_1 = __webpack_require__(/*! ./AnterosErrorMessageHelper */ "./src/AnterosErrorMessageHelper.ts");
const universal_base64_1 = __webpack_require__(/*! universal-base64 */ "universal-base64");
const qs_1 = __importDefault(__webpack_require__(/*! qs */ "qs"));
const anteros_react_core_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-core */ "@anterostecnologia/anteros-react-core");
var CryptoJS = __webpack_require__(/*! crypto-js */ "crypto-js");
class ApiConfiguration {
    constructor(urlBase, secretKey, localStorage, urlSaaS) {
        this._urlBase = urlBase;
        this._secretKey = secretKey;
        this._urlSaaS = urlSaaS;
        this._localStorage = localStorage;
    }
    /**
     * Getter urlBase
     * @return {string}
     */
    get urlBase() {
        return this._urlBase;
    }
    /**
     * Getter secretKey
     * @return {string}
     */
    get secretKey() {
        return this._secretKey;
    }
    /**
     * Setter urlBase
     * @param {string} value
     */
    set urlBase(value) {
        this._urlBase = value;
    }
    /**
     * Setter secretKey
     * @param {string} value
     */
    set secretKey(value) {
        this._secretKey = value;
    }
    /**
     * Getter urlSaaS
     * @return {string}
     */
    get urlSaaS() {
        return this._urlSaaS;
    }
    /**
     * Getter credentials
     * @return {Object}
     */
    get credentials() {
        return this._credentials;
    }
    /**
     * Getter localStorage
     * @return {any}
     */
    get localStorage() {
        return this._localStorage;
    }
    /**
     * Setter urlSaaS
     * @param {string} value
     */
    set urlSaaS(value) {
        this._urlSaaS = value;
    }
    /**
     * Setter credentials
     * @param {Object} value
     */
    set credentials(value) {
        this._credentials = value;
    }
    /**
     * Setter localStorage
     * @param {any} value
     */
    set localStorage(value) {
        this._localStorage = value;
    }
}
exports.ApiConfiguration = ApiConfiguration;
const handleServiceError = (error) => {
    console.log(error);
};
class DatasourceApiAdapter {
    constructor(apiClient) {
        this._apiClient = apiClient;
    }
    save(config) {
        return this._apiClient(config);
    }
    delete(config) {
        return this._apiClient(config);
    }
    get(config) {
        return this._apiClient(config);
    }
}
exports.DatasourceApiAdapter = DatasourceApiAdapter;
class AnterosAxiosApiClient {
    constructor(apiConfiguration, userService) {
        this.getOptions = () => {
            return {
                invalidTokenStatuses: [401],
                tokenHeaderName: "authorization",
                buildTokenHeader: function (_token) {
                    return `bearer ${_token}`;
                },
            };
        };
        this.configureRequest = (config) => {
            const _token = this.userService.getToken();
            if (_token) {
                config.baseURL = this.apiConfiguration.urlBase;
                config.headers["Authorization"] = this.getAuthorizationHeader(_token); // para Spring Boot back-end
                config.headers["Access-Control-Allow-Origin"] = "*";
                config.headers["Access-Control-Allow-Methods"] =
                    "POST, GET, OPTIONS, DELETE";
                config.headers["Access-Control-Max-Age"] = "3600";
                config.headers["Access-Control-Allow-Headers"] =
                    "Accept, Accept-CH, Accept-Charset, Accept-Datetime, Accept-Encoding, Accept-Ext, Accept-Features, Accept-Language, Accept-Params, Accept-Ranges, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Expose-Headers, Access-Control-Max-Age, Access-Control-Request-Headers, Access-Control-Request-Method, Age, Allow, Alternates, Authentication-Info, Authorization, C-Ext, C-Man, C-Opt, C-PEP, C-PEP-Info, CONNECT, Cache-Control, Compliance, Connection, Content-Base, Content-Disposition, Content-Encoding, Content-ID, Content-Language, Content-Length, Content-Location, Content-MD5, Content-Range, Content-Script-Type, Content-Security-Policy, Content-Style-Type, Content-Transfer-Encoding, Content-Type, Content-Version, Cookie, Cost, DAV, DELETE, DNT, DPR, Date, Default-Style, Delta-Base, Depth, Derived-From, Destination, Differential-ID, Digest, ETag, Expect, Expires, Ext, From, GET, GetProfile, HEAD, HTTP-date, Host, IM, If, If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since, Keep-Alive, Label, Last-Event-ID, Last-Modified, Link, Location, Lock-Token, MIME-Version, Man, Max-Forwards, Media-Range, Message-ID, Meter, Negotiate, Non-Compliance, OPTION, OPTIONS, OWS, Opt, Optional, Ordering-Type, Origin, Overwrite, P3P, PEP, PICS-Label, POST, PUT, Pep-Info, Permanent, Position, Pragma, ProfileObject, Protocol, Protocol-Query, Protocol-Request, Proxy-Authenticate, Proxy-Authentication-Info, Proxy-Authorization, Proxy-Features, Proxy-Instruction, Public, RWS, Range, Referer, Refresh, Resolution-Hint, Resolver-Location, Retry-After, Safe, Sec-Websocket-Extensions, Sec-Websocket-Key, Sec-Websocket-Origin, Sec-Websocket-Protocol, Sec-Websocket-Version, Security-Scheme, Server, Set-Cookie, Set-Cookie2, SetProfile, SoapAction, Status, Status-URI, Strict-Transport-Security, SubOK, Subst, Surrogate-Capability, Surrogate-Control, TCN, TE, TRACE, Timeout, Title, Trailer, Transfer-Encoding, UA-Color, UA-Media, UA-Pixels, UA-Resolution, UA-Windowpixels, URI, Upgrade, User-Agent, Variant-Vary, Vary, Version, Via, Viewport-Width, WWW-Authenticate, Want-Digest, Warning, Width, X-Content-Duration, X-Content-Security-Policy, X-Content-Type-Options, X-CustomHeader, X-DNSPrefetch-Control, X-Forwarded-For, X-Forwarded-Port, X-Forwarded-Proto, X-Frame-Options, X-Modified, X-OTHER, X-PING, X-PINGOTHER, X-Powered-By, X-Requested-With";
            }
            return config;
        };
        this.getAuthorizationHeader = (accessToken) => this.getOptions().buildTokenHeader(accessToken);
        this.apiConfiguration = apiConfiguration;
        this.userService = userService;
        this.client = this.createAxiosClient(apiConfiguration);
    }
    getClient() {
        return this.client;
    }
    getConfiguration() {
        return this.apiConfiguration;
    }
    onSuccess(_userData) {
        //
    }
    onError(error) {
        console.log(error);
    }
    createAxiosClient(apiConfiguration) {
        let result = axios_1.default.create({
            baseURL: apiConfiguration.urlBase,
            responseType: "json",
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 180 * 1000,
        });
        result.interceptors.request.use((config) => {
            return this.configureRequest(config);
        }, (error) => {
            return Promise.reject(error);
        });
        result.interceptors.response.use((response) => {
            return response;
        }, (err) => __awaiter(this, void 0, void 0, function* () {
            const originalConfig = err.config;
            if (err.response) {
                if (err.response.status === 401 && !originalConfig._retry) {
                    originalConfig._retry = true;
                    try {
                        yield this.userService.updateToken(5, (userData) => {
                            this.onSuccess(userData);
                        }, (error) => {
                            this.onError(error);
                        });
                        return this.client(this.configureRequest(originalConfig));
                    }
                    catch (_error) {
                        if (_error.response && _error.response.data) {
                            return Promise.reject(_error.response.data);
                        }
                        return Promise.reject(_error);
                    }
                }
                if (err.response.status === 403 && err.response.data) {
                    return Promise.reject(err.response.data);
                }
            }
            return Promise.reject(err);
        }));
        return result;
    }
    applyAuthorization(config) {
        return this.configureRequest(config);
    }
    post(path, payload, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = config
                    ? yield this.client.post(path, payload, config)
                    : yield this.client.post(path, payload);
                return response.data;
            }
            catch (error) {
                return new Promise(() => {
                    throw new Error((0, AnterosErrorMessageHelper_1.processErrorMessage)(error));
                });
            }
        });
    }
    patch(path, payload, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.patch(path, payload, config);
                return response.data;
            }
            catch (error) {
                return new Promise(() => {
                    throw new Error((0, AnterosErrorMessageHelper_1.processErrorMessage)(error));
                });
            }
        });
    }
    put(path, payload, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.put(path, payload, config);
                return response.data;
            }
            catch (error) {
                return new Promise(() => {
                    throw new Error((0, AnterosErrorMessageHelper_1.processErrorMessage)(error));
                });
            }
        });
    }
    delete(path, payload, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let _config = Object.assign(Object.assign({}, config), { data: payload });
                const response = yield this.client.delete(path, _config);
                return response.data;
            }
            catch (error) {
                handleServiceError(error);
            }
            return {};
        });
    }
    get(path, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(path, config);
                return response.data;
            }
            catch (error) {
                handleServiceError(error);
                return new Promise(() => {
                    throw new Error((0, AnterosErrorMessageHelper_1.processErrorMessage)(error));
                });
            }
        });
    }
    setCredentials(credentials) {
        this.apiConfiguration.credentials = credentials;
        return this;
    }
    setBaseURL(urlBase) {
        this.apiConfiguration.urlBase = urlBase;
        axios_1.default.defaults.baseURL = urlBase;
        return this;
    }
    getSavedUserInformation(credentials) {
        let userInfo = {};
        const KEY_USER_INFO = (credentials.owner ? credentials.owner + "_" : "") +
            credentials.username +
            "_userInfo";
        userInfo = this.apiConfiguration.localStorage.getItem(KEY_USER_INFO);
        if (userInfo) {
            userInfo = this.decryptionWithCryptoJS(userInfo);
            userInfo = anteros_react_core_1.AnterosJacksonParser.convertJsonToObject(qs_1.default.parse(userInfo));
            return userInfo;
        }
    }
    getSavedEndpointInformation(credentials) {
        let userInfo = {};
        const KEY_ENDPOINT_INFO = (credentials.owner ? credentials.owner + "_" : "") +
            credentials.username +
            "_endpointInfo";
        userInfo = this.apiConfiguration.localStorage.getItem(KEY_ENDPOINT_INFO);
        if (userInfo) {
            userInfo = this.decryptionWithCryptoJS(userInfo);
            userInfo = anteros_react_core_1.AnterosJacksonParser.convertJsonToObject(qs_1.default.parse(userInfo));
            return userInfo;
        }
    }
    getUserInformation(credentials, ownerUrl, onError, onSuccess) {
        return this._getUserInformation(credentials, ownerUrl, onError, onSuccess);
    }
    clear(credentials) {
        const KEY_USER_INFO = (credentials.owner ? credentials.owner + "_" : "") +
            credentials.username +
            "_userInfo";
        const KEY_ENDPOINT_INFO = (credentials.owner ? credentials.owner + "_" : "") +
            credentials.username +
            "_endpointInfo";
        const KEY_OWNER_INFO = (credentials.owner ? credentials.owner + "_" : "") +
            credentials.username +
            "_ownerInfo";
        this.apiConfiguration.localStorage.removeItem(KEY_USER_INFO);
        this.apiConfiguration.localStorage.removeItem(KEY_ENDPOINT_INFO);
        this.apiConfiguration.localStorage.removeItem(KEY_OWNER_INFO);
    }
    updateEndpointInformation(credentials, endpoints) {
        const KEY_ENDPOINT_INFO = (credentials.owner ? credentials.owner + "_" : "") +
            credentials.username +
            "_endpointInfo";
        const _endpoints = this.encryptWithCryptoJS(qs_1.default.stringify(endpoints));
        this.apiConfiguration.localStorage.setItem(KEY_ENDPOINT_INFO, _endpoints);
    }
    updateOwnerInfo(credentials, owner) {
        const KEY_OWNER_INFO = (credentials.owner ? credentials.owner + "_" : "") +
            credentials.username +
            "_ownerInfo";
        const _owner = this.encryptWithCryptoJS(qs_1.default.stringify(owner));
        this.apiConfiguration.localStorage.setItem(KEY_OWNER_INFO, _owner);
    }
    _getUserInformation(credentials, ownerUrl, onError, onSuccess, tryCount = 1) {
        return new Promise((resolve, reject) => {
            return (0, axios_1.default)({
                url: `${ownerUrl.urlAPI + "/v1"}/user/getUserByLogin`,
                method: "post",
                headers: {
                    Authorization: `Bearer ${this.userService.getToken()}`,
                    "Content-Type": "text/plain",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
                    "Access-Control-Max-Age": "3600",
                    "X-Tenant-ID": `${credentials.owner ? credentials.owner : ""}`,
                    "Access-Control-Allow-Headers": "Accept, Accept-CH, Accept-Charset, Accept-Datetime, Accept-Encoding, Accept-Ext, Accept-Features, Accept-Language, Accept-Params, Accept-Ranges, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Expose-Headers, Access-Control-Max-Age, Access-Control-Request-Headers, Access-Control-Request-Method, Age, Allow, Alternates, Authentication-Info, Authorization, C-Ext, C-Man, C-Opt, C-PEP, C-PEP-Info, CONNECT, Cache-Control, Compliance, Connection, Content-Base, Content-Disposition, Content-Encoding, Content-ID, Content-Language, Content-Length, Content-Location, Content-MD5, Content-Range, Content-Script-Type, Content-Security-Policy, Content-Style-Type, Content-Transfer-Encoding, Content-Type, Content-Version, Cookie, Cost, DAV, DELETE, DNT, DPR, Date, Default-Style, Delta-Base, Depth, Derived-From, Destination, Differential-ID, Digest, ETag, Expect, Expires, Ext, From, GET, GetProfile, HEAD, HTTP-date, Host, IM, If, If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since, Keep-Alive, Label, Last-Event-ID, Last-Modified, Link, Location, Lock-Token, MIME-Version, Man, Max-Forwards, Media-Range, Message-ID, Meter, Negotiate, Non-Compliance, OPTION, OPTIONS, OWS, Opt, Optional, Ordering-Type, Origin, Overwrite, P3P, PEP, PICS-Label, POST, PUT, Pep-Info, Permanent, Position, Pragma, ProfileObject, Protocol, Protocol-Query, Protocol-Request, Proxy-Authenticate, Proxy-Authentication-Info, Proxy-Authorization, Proxy-Features, Proxy-Instruction, Public, RWS, Range, Referer, Refresh, Resolution-Hint, Resolver-Location, Retry-After, Safe, Sec-Websocket-Extensions, Sec-Websocket-Key, Sec-Websocket-Origin, Sec-Websocket-Protocol, Sec-Websocket-Version, Security-Scheme, Server, Set-Cookie, Set-Cookie2, SetProfile, SoapAction, Status, Status-URI, Strict-Transport-Security, SubOK, Subst, Surrogate-Capability, Surrogate-Control, TCN, TE, TRACE, Timeout, Title, Trailer, Transfer-Encoding, UA-Color, UA-Media, UA-Pixels, UA-Resolution, UA-Windowpixels, URI, Upgrade, User-Agent, Variant-Vary, Vary, Version, Via, Viewport-Width, WWW-Authenticate, Want-Digest, Warning, Width, X-Content-Duration, X-Content-Security-Policy, X-Content-Type-Options, X-CustomHeader, X-DNSPrefetch-Control, X-Forwarded-For, X-Forwarded-Port, X-Forwarded-Proto, X-Frame-Options, X-Modified, X-OTHER, X-PING, X-PINGOTHER, X-Powered-By, X-Requested-With",
                },
                data: credentials.username,
            })
                .then((response) => {
                if (response.data === "" || response.data === undefined) {
                    onError("Usuário/senha não encontrados!");
                }
                else {
                    let data = anteros_react_core_1.AnterosJacksonParser.convertJsonToObject(response.data);
                    onSuccess(data);
                }
            })
                .catch((error) => {
                onError("Usuário/senha não encontrados!");
            });
        });
    }
    validateOwner(credentials, onError, onSuccess) {
        let _this = this;
        return new Promise((resolve, reject) => {
            return (0, axios_1.default)({
                url: `${_this.apiConfiguration.urlSaaS}/validation/queryTenant/${credentials.owner}`,
                method: "get",
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                },
            })
                .then((response) => {
                if (response.data === "" || response.data === undefined) {
                    onError((0, AnterosErrorMessageHelper_1.processErrorMessage)(response));
                }
                else {
                    _this.updateEndpointInformation(credentials, response.data);
                    let data = anteros_react_core_1.AnterosJacksonParser.convertJsonToObject(response.data);
                    onSuccess(data);
                }
            })
                .catch((error) => {
                onError((0, AnterosErrorMessageHelper_1.processErrorMessage)(error));
            });
        });
    }
    getQueryOwners(owners, onError, onSuccess) {
        return new Promise((resolve, reject) => {
            return (0, axios_1.default)({
                url: `${this.apiConfiguration.urlSaaS}/validation/queryTenants/${owners}`,
                method: "get",
            })
                .then(function (response) {
                let list = anteros_react_core_1.AnterosJacksonParser.convertJsonToObject(response.data);
                onSuccess(list);
            })
                .catch(function (error) {
                onError((0, AnterosErrorMessageHelper_1.processErrorMessage)(error));
            });
        });
    }
    getQueryOwnersByUser(user, onError, onSuccess) {
        return new Promise((resolve, reject) => {
            return (0, axios_1.default)({
                url: `${this.apiConfiguration.urlSaaS}/validation/queryTenantsByUserWeb`,
                method: "post",
                data: (0, universal_base64_1.encode)(user),
            })
                .then(function (response) {
                let list = anteros_react_core_1.AnterosJacksonParser.convertJsonToObject(response.data);
                onSuccess(list);
            })
                .catch(function (error) {
                onError((0, AnterosErrorMessageHelper_1.processErrorMessage)(error));
            });
        });
    }
    getOwnerInfo(credentials, profile, ownerUrl, onError, onSuccess, tryCount = 1) {
        let ownerInfo = {};
        const KEY_ONWER_INFO = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_ownerInfo`;
        ownerInfo = this.apiConfiguration.localStorage.getItem(KEY_ONWER_INFO);
        if (ownerInfo && ownerInfo !== "null") {
            ownerInfo = this.decryptionWithCryptoJS(ownerInfo);
            ownerInfo = anteros_react_core_1.AnterosJacksonParser.convertJsonToObject(qs_1.default.parse(ownerInfo));
            return new Promise((resolve, reject) => {
                onSuccess(ownerInfo);
                return;
            });
        }
        else {
            let _this = this;
            return new Promise((resolve, reject) => {
                return axios_1.default
                    .get(`${ownerUrl.urlAPI}/v1/empresa/buscarProprietario/${credentials.owner}`, {
                    headers: {
                        Authorization: `Bearer ${this.userService.getToken()}`,
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
                        "Access-Control-Max-Age": "3600",
                        "Access-Control-Allow-Headers": "Accept, Accept-CH, Accept-Charset, Accept-Datetime, Accept-Encoding, Accept-Ext, Accept-Features, Accept-Language, Accept-Params, Accept-Ranges, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Expose-Headers, Access-Control-Max-Age, Access-Control-Request-Headers, Access-Control-Request-Method, Age, Allow, Alternates, Authentication-Info, Authorization, C-Ext, C-Man, C-Opt, C-PEP, C-PEP-Info, CONNECT, Cache-Control, Compliance, Connection, Content-Base, Content-Disposition, Content-Encoding, Content-ID, Content-Language, Content-Length, Content-Location, Content-MD5, Content-Range, Content-Script-Type, Content-Security-Policy, Content-Style-Type, Content-Transfer-Encoding, Content-Type, Content-Version, Cookie, Cost, DAV, DELETE, DNT, DPR, Date, Default-Style, Delta-Base, Depth, Derived-From, Destination, Differential-ID, Digest, ETag, Expect, Expires, Ext, From, GET, GetProfile, HEAD, HTTP-date, Host, IM, If, If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since, Keep-Alive, Label, Last-Event-ID, Last-Modified, Link, Location, Lock-Token, MIME-Version, Man, Max-Forwards, Media-Range, Message-ID, Meter, Negotiate, Non-Compliance, OPTION, OPTIONS, OWS, Opt, Optional, Ordering-Type, Origin, Overwrite, P3P, PEP, PICS-Label, POST, PUT, Pep-Info, Permanent, Position, Pragma, ProfileObject, Protocol, Protocol-Query, Protocol-Request, Proxy-Authenticate, Proxy-Authentication-Info, Proxy-Authorization, Proxy-Features, Proxy-Instruction, Public, RWS, Range, Referer, Refresh, Resolution-Hint, Resolver-Location, Retry-After, Safe, Sec-Websocket-Extensions, Sec-Websocket-Key, Sec-Websocket-Origin, Sec-Websocket-Protocol, Sec-Websocket-Version, Security-Scheme, Server, Set-Cookie, Set-Cookie2, SetProfile, SoapAction, Status, Status-URI, Strict-Transport-Security, SubOK, Subst, Surrogate-Capability, Surrogate-Control, TCN, TE, TRACE, Timeout, Title, Trailer, Transfer-Encoding, UA-Color, UA-Media, UA-Pixels, UA-Resolution, UA-Windowpixels, URI, Upgrade, User-Agent, Variant-Vary, Vary, Version, Via, Viewport-Width, WWW-Authenticate, Want-Digest, Warning, Width, X-Content-Duration, X-Content-Security-Policy, X-Content-Type-Options, X-CustomHeader, X-DNSPrefetch-Control, X-Forwarded-For, X-Forwarded-Port, X-Forwarded-Proto, X-Frame-Options, X-Modified, X-OTHER, X-PING, X-PINGOTHER, X-Powered-By, X-Requested-With",
                    },
                })
                    .then((response) => {
                    if (response.data === "" || response.data === undefined) {
                        onError("Proprietário do sistema não encontrado!");
                    }
                    else {
                        _this.updateOwnerInfo(credentials, response.data);
                        let data = anteros_react_core_1.AnterosJacksonParser.convertJsonToObject(response.data);
                        onSuccess(data);
                    }
                })
                    .catch((error) => {
                    onError("Proprietário do sistema não encontrado!");
                });
            });
        }
    }
    getSecretKey() {
        return (0, universal_base64_1.decode)(this.apiConfiguration.secretKey);
    }
    encryptWithCryptoJS(plainText) {
        let sk = this.getSecretKey();
        const key = CryptoJS.enc.Utf8.parse(sk);
        const iv1 = CryptoJS.enc.Utf8.parse(sk);
        const encrypted = CryptoJS.AES.encrypt(plainText, key, {
            keySize: 16,
            iv: iv1,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        return encrypted + "";
    }
    decryptionWithCryptoJS(cipher) {
        let sk = this.getSecretKey();
        const key = CryptoJS.enc.Utf8.parse(sk);
        const iv1 = CryptoJS.enc.Utf8.parse(sk);
        const plainText = CryptoJS.AES.decrypt(cipher, key, {
            keySize: 16,
            iv: iv1,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        return plainText.toString(CryptoJS.enc.Utf8);
    }
}
exports.AnterosAxiosApiClient = AnterosAxiosApiClient;


/***/ }),

/***/ "./src/AnterosRemoteResource.ts":
/*!**************************************!*\
  !*** ./src/AnterosRemoteResource.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosRemoteResource = exports.PUTCH = exports.GET = exports.DELETE = exports.POST = void 0;
const anteros_react_core_1 = __webpack_require__(/*! @anterostecnologia/anteros-react-core */ "@anterostecnologia/anteros-react-core");
const AnterosReduxHelper_1 = __webpack_require__(/*! ./AnterosReduxHelper */ "./src/AnterosReduxHelper.ts");
exports.POST = "post";
exports.DELETE = "delete";
exports.GET = "get";
exports.PUTCH = "putch";
class AnterosRemoteResource {
    constructor(reducerName, resourceName, apiClient, userService, url, searchReducerName) {
        this._useCode = false;
        this._apiClient = apiClient;
        this._reducerName = reducerName;
        this._resourceName = resourceName;
        this._userService = userService;
        this._url = url;
        this._searchReducerName = searchReducerName !== null && searchReducerName !== void 0 ? searchReducerName : reducerName;
    }
    getFieldNameID() {
        return "id";
    }
    getApiClient() {
        return this._apiClient;
    }
    setApiClient(apiClient) {
        this._apiClient = apiClient;
    }
    getReducerName() {
        return this._reducerName;
    }
    setReducerName(reducerName) {
        this._resourceName = reducerName;
    }
    getSearchReducerName() {
        return this._searchReducerName;
    }
    setSearchReducerName(searchReducerName) {
        this._searchReducerName = searchReducerName;
    }
    getResourceName() {
        return this._resourceName;
    }
    setResourceName(resourceName) {
        this._resourceName = resourceName;
    }
    getUseCode() {
        return this._useCode;
    }
    setUseCode(useCode) {
        this._useCode = useCode;
    }
    get userService() {
        return this._userService;
    }
    getCustomActions() { }
    getCustomSearchActions() { }
    get searchActions() {
        const customSearchActions = this.getCustomSearchActions();
        if (customSearchActions) {
            return customSearchActions;
        }
        return (0, AnterosReduxHelper_1.makeDefaultReduxActions)(`${this._reducerName.toUpperCase()}_SEARCH`);
    }
    get actions() {
        const customActions = this.getCustomActions();
        if (customActions) {
            return customActions;
        }
        return (0, AnterosReduxHelper_1.makeDefaultReduxActions)(`${this._reducerName.toUpperCase()}`);
    }
    get url() {
        if (!this._url) {
            return this._apiClient.getConfiguration().urlBase + "/";
        }
        return this._url + "/";
    }
    save(entity) {
        let result = {
            url: `${this.url}${this._resourceName}`,
            method: exports.POST,
            data: anteros_react_core_1.AnterosJacksonParser.convertObjectToJson(entity),
            headers: {},
        };
        let user = this._userService.getUserData();
        result = this.applyOwner(this._userService.getUserData(), result);
        if (user && user.company) {
            result = Object.assign(Object.assign({}, result), { headers: Object.assign(Object.assign({}, result.headers), { "X-Company-ID": user.company.id }) });
        }
        else if (entity.hasOwnProperty("cdEmpresa") && entity["cdEmpresa"]) {
            result = Object.assign(Object.assign({}, result), { headers: Object.assign(Object.assign({}, result.headers), { "X-Company-ID": entity["cdEmpresa"] }) });
        }
        return result;
    }
    delete(entity) {
        let result = {
            url: `${this.url}${this._resourceName}${entity[this.getFieldNameID()]}`,
            method: exports.DELETE,
        };
        result = this.applyOwner(this._userService.getUserData(), result);
        return this.applyCompany(this._userService.getUserData(), result);
    }
    deleteById(id) {
        let result = {
            url: `${this.url}${this._resourceName}${id}`,
            method: exports.DELETE,
        };
        result = this.applyOwner(this._userService.getUserData(), result);
        return this.applyCompany(this._userService.getUserData(), result);
    }
    validate(entity) {
        let result = {
            url: `${this.url}${this._resourceName}validate`,
            method: exports.POST,
            data: anteros_react_core_1.AnterosJacksonParser.convertObjectToJson(entity),
        };
        result = this.applyOwner(this._userService.getUserData(), result);
        return this.applyCompany(this._userService.getUserData(), result);
    }
    findOne(value, fieldsToForceLazy = "") {
        let result;
        let user = this._userService.getUserData();
        if (user && user.owner && this._useCode === true) {
            result = {
                url: `${this._resourceName}code/${value}?fieldsToForceLazy=${fieldsToForceLazy}`,
                method: exports.GET,
            };
        }
        else {
            result = {
                url: `${this._resourceName}${value}?fieldsToForceLazy=${fieldsToForceLazy}`,
                method: exports.GET,
            };
        }
        result = this.applyOwner(this._userService.getUserData(), result);
        return this.applyCompany(this._userService.getUserData(), result);
    }
    findAll(page, size, sort, fieldsToForceLazy = "", _companyId = undefined) {
        let user = this._userService.getUserData();
        let result = {
            url: `${this.url}${this._resourceName}findAll?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`,
            method: exports.GET,
            headers: {},
        };
        this.applySort(sort, result);
        result = this.applyOwner(user, result);
        return this.applyCompany(this._userService.getUserData(), result);
    }
    findWithFilter(data, page, size, fieldsToForceLazy = "") {
        let result = {
            url: `${this.url}${this._resourceName}findWithFilter?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`,
            data: data,
            method: exports.POST,
        };
        result = this.applyOwner(this._userService.getUserData(), result);
        return this.applyCompany(this._userService.getUserData(), result);
    }
    findMultipleFields(filter, fields, page, size, sort, fieldsToForceLazy = "") {
        let result = {
            url: `${this.url}${this._resourceName}findMultipleFields?filter=${encodeURIComponent(filter)}&fields=${fields}&page=${page}&size=${size}&sort=${sort}&fieldsToForceLazy=${fieldsToForceLazy}`,
            method: exports.POST,
        };
        result = this.applyOwner(this._userService.getUserData(), result);
        return this.applyCompany(this._userService.getUserData(), result);
    }
    findAllByRelationShip(field, id, page, size, sort, fieldsToForceLazy = "") {
        let url = `${this._resourceName}findAllByRelationShip/${field}/${id}?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`;
        if (sort && sort.length > 0) {
            url += `&sort=${sort}`;
        }
        let result1 = {
            url,
            method: exports.GET,
        };
        let user = this._userService.getUserData();
        if (user && user.owner) {
            result1 = Object.assign(Object.assign({}, result1), { headers: {
                    "X-Tenant-ID": user.owner,
                    "X-Company-ID": user.company.id,
                } });
        }
        return result1;
    }
    findWithFilterByRelationShip(field, id, filter, page, size, fieldsToForceLazy = "") {
        let result = {
            url: `${this._resourceName}findWithFilterByRelationShip/${field}/${id}?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`,
            data: filter,
            method: exports.POST,
        };
        return result;
    }
    findMultipleFieldsByRelationShip(field, id, filter, fields, page, size, sort, fieldsToForceLazy = "") {
        let result = {
            url: `${this._resourceName}findMultipleFieldsByRelationShip/${field}/${id}?filter=${encodeURIComponent(filter)}&fields=${fields}&page=${page}&size=${size}&sort=${sort}&fieldsToForceLazy=${fieldsToForceLazy}`,
            method: exports.POST,
        };
        return result;
    }
    applySort(sort, result) {
        if (sort) {
            result.url = `${result.url}&sort=${sort}`;
        }
    }
    applyCompany(user, result) {
        if (user && user.company) {
            result = Object.assign(Object.assign({}, result), { headers: Object.assign(Object.assign({}, result.headers), { "X-Company-ID": user.company.id }) });
        }
        if (user && user.store) {
            result = Object.assign(Object.assign({}, result), { headers: Object.assign(Object.assign({}, result.headers), { "X-Company-ID": user.store.company.id }) });
        }
        return result;
    }
    applyOwner(user, result) {
        if (user && user.owner) {
            result = Object.assign(Object.assign({}, result), { headers: {
                    "X-Tenant-ID": user.owner,
                } });
        }
        return result;
    }
    execute(config) {
        if (config.method === exports.POST) {
            return this._apiClient.post(config.url, config.data, config);
        }
        else if (config.method === exports.GET) {
            return this._apiClient.get(config.url, config);
        }
        else if (config.method === exports.PUTCH) {
            return this._apiClient.put(config.url, config.data, config);
        }
        else if (config.method === exports.DELETE) {
            return this._apiClient.delete(config.url, config.data, config);
        }
        throw new Error("Configuração inválida " + config);
    }
    buildLookupValue(value, onSuccess, onError, fieldsToForceLazy = "") {
        return new Promise((resolve, reject) => {
            this._apiClient
                .get(this.findOne(value, fieldsToForceLazy))
                .then((data) => {
                resolve(data);
                if (onSuccess) {
                    onSuccess(data);
                }
            })
                .catch((error) => {
                reject(error);
                if (onError) {
                    onError(error);
                }
            });
        });
    }
}
exports.AnterosRemoteResource = AnterosRemoteResource;


/***/ }),

/***/ "./src/AnterosUserService.ts":
/*!***********************************!*\
  !*** ./src/AnterosUserService.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnterosKeycloakUserService = exports.UserConfig = void 0;
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "axios"));
const universal_base64_1 = __webpack_require__(/*! universal-base64 */ "universal-base64");
const qs_1 = __importDefault(__webpack_require__(/*! qs */ "qs"));
__webpack_require__(/*! regenerator-runtime/runtime */ "regenerator-runtime/runtime");
const AnterosErrorMessageHelper_1 = __webpack_require__(/*! ./AnterosErrorMessageHelper */ "./src/AnterosErrorMessageHelper.ts");
class UserConfig {
    constructor(url, realm, clientId, clientSecret, owner, localStorage, secretKey, tokenTimeoutHandle, onAuthError, onAuthLogout, onAuthLogin, onAuthRefreshSuccess, onAuthRefreshError, onTokenExpired) {
        this._url = url;
        this._realm = realm;
        this._clientId = clientId;
        this._clientSecret = clientSecret;
        this._owner = owner;
        this._tokenTimeoutHandle = tokenTimeoutHandle;
        this._onAuthError = onAuthError;
        this._onAuthLogout = onAuthLogout;
        this._onAuthLogin = onAuthLogin;
        this._onAuthRefreshSuccess = onAuthRefreshSuccess;
        this._onAuthRefreshError = onAuthRefreshError;
        this._onTokenExpired = onTokenExpired;
        this._localStorage = localStorage;
        this._secretKey = secretKey;
    }
    /**
     * Getter url
     * @return {string}
     */
    get url() {
        return this._url;
    }
    /**
     * Getter realm
     * @return {string}
     */
    get realm() {
        return this._realm;
    }
    /**
     * Getter clientId
     * @return {string}
     */
    get clientId() {
        return this._clientId;
    }
    /**
     * Getter clientSecret
     * @return {string}
     */
    get clientSecret() {
        return this._clientSecret;
    }
    /**
     * Getter tokenTimeoutHandle
     * @return {number}
     */
    get tokenTimeoutHandle() {
        return this._tokenTimeoutHandle;
    }
    /**
     * Getter onAuthError
     * @return {Function}
     */
    get onAuthError() {
        return this._onAuthError;
    }
    /**
     * Getter onAuthLogout
     * @return {Function}
     */
    get onAuthLogout() {
        return this._onAuthLogout;
    }
    /**
     * Getter onAuthLogin
     * @return {Function}
     */
    get onAuthLogin() {
        return this._onAuthLogin;
    }
    /**
     * Getter onAuthRefreshSuccess
     * @return {Function}
     */
    get onAuthRefreshSuccess() {
        return this._onAuthRefreshSuccess;
    }
    /**
     * Getter onAuthRefreshError
     * @return {Function}
     */
    get onAuthRefreshError() {
        return this._onAuthRefreshError;
    }
    /**
     * Getter onTokenExpired
     * @return {Function}
     */
    get onTokenExpired() {
        return this._onTokenExpired;
    }
    /**
     * Setter url
     * @param {string} value
     */
    set url(value) {
        this._url = value;
    }
    /**
     * Setter realm
     * @param {string} value
     */
    set realm(value) {
        this._realm = value;
    }
    /**
     * Setter clientId
     * @param {string} value
     */
    set clientId(value) {
        this._clientId = value;
    }
    /**
     * Setter clientSecret
     * @param {string} value
     */
    set clientSecret(value) {
        this._clientSecret = value;
    }
    /**
     * Setter tokenTimeoutHandle
     * @param {number} value
     */
    set tokenTimeoutHandle(value) {
        this._tokenTimeoutHandle = value;
    }
    /**
     * Setter onAuthError
     * @param {Function} value
     */
    set onAuthError(value) {
        this._onAuthError = value;
    }
    /**
     * Setter onAuthLogout
     * @param {Function} value
     */
    set onAuthLogout(value) {
        this._onAuthLogout = value;
    }
    /**
     * Setter onAuthLogin
     * @param {Function} value
     */
    set onAuthLogin(value) {
        this._onAuthLogin = value;
    }
    /**
     * Setter onAuthRefreshSuccess
     * @param {Function} value
     */
    set onAuthRefreshSuccess(value) {
        this._onAuthRefreshSuccess = value;
    }
    /**
     * Setter onAuthRefreshError
     * @param {Function} value
     */
    set onAuthRefreshError(value) {
        this._onAuthRefreshError = value;
    }
    /**
     * Setter onTokenExpired
     * @param {Function} value
     */
    set onTokenExpired(value) {
        this._onTokenExpired = value;
    }
    /**
     * Getter owner
     * @return {string}
     */
    get owner() {
        return this._owner;
    }
    /**
     * Setter owner
     * @param {string} value
     */
    set owner(value) {
        this._owner = value;
    }
    /**
     * Getter localStorage
     * @return {any}
     */
    get localStorage() {
        return this._localStorage;
    }
    /**
     * Setter localStorage
     * @param {any} value
     */
    set localStorage(value) {
        this._localStorage = value;
    }
    /**
     * Getter secretKey
     * @return {string}
     */
    get secretKey() {
        return this._secretKey;
    }
    /**
     * Setter secretKey
     * @param {string} value
     */
    set secretKey(value) {
        this._secretKey = value;
    }
}
exports.UserConfig = UserConfig;
class AnterosKeycloakUserService {
    constructor(config) {
        this.authenticated = false;
        this.userConfig = config;
        this.owner = config.owner;
    }
    getUserData() {
        return {
            id: this.getId(),
            avatar: this.getAvatar(),
            email: this.getEmail(),
            fullName: this.getFullName(),
            name: this.getName(),
            userName: this.getUsername(),
            token: this.getToken(),
            company: this.getCompany(),
            owner: this.getOwner(),
            role: this.getRole(),
            store: this.getStore(),
            userSystem: this.getUserSystem(),
        };
    }
    login(username, password, successCallback, errorCallback) {
        var data = qs_1.default.stringify({
            client_id: this.userConfig.clientId,
            username: username,
            password: password,
            grant_type: "password",
            client_secret: this.userConfig.clientSecret,
        });
        var config = {
            method: "post",
            url: `${this.userConfig.url}/realms/${this.userConfig.realm}/protocol/openid-connect/token`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: data,
        };
        var timeLocal = new Date().getTime();
        (0, axios_1.default)(config)
            .then((response) => {
            console.log("[OAUTH2] Token atualizado.");
            timeLocal = (timeLocal + new Date().getTime()) / 2;
            var tokenResponse = response.data;
            this.setToken(tokenResponse["access_token"], tokenResponse["refresh_token"], tokenResponse["id_token"], timeLocal);
            successCallback &&
                successCallback({
                    id: this.getId(),
                    userName: this.getUsername(),
                    token: tokenResponse,
                    name: this.getName(),
                    fullName: this.getFullName(),
                    email: this.getEmail(),
                    avatar: this.getAvatar(),
                    company: this.getCompany(),
                    owner: this.getOwner(),
                    role: this.getRole(),
                    store: this.getStore(),
                    userSystem: this.getUserSystem(),
                });
        })
            .catch((error) => {
            this.clearToken();
            errorCallback && errorCallback((0, AnterosErrorMessageHelper_1.processErrorMessage)(error));
        });
    }
    logout() {
        this.authenticated = false;
        this.clearToken();
    }
    isLoggedIn() {
        return this.authenticated;
    }
    getToken() {
        return this.token;
    }
    setToken(token, refreshToken, idToken, timeLocal) {
        if (this.userConfig.tokenTimeoutHandle) {
            clearTimeout(this.userConfig.tokenTimeoutHandle);
            this.userConfig.tokenTimeoutHandle = undefined;
        }
        if (refreshToken) {
            this.refreshToken = refreshToken;
        }
        else {
            this.refreshToken = undefined;
        }
        if (idToken) {
        }
        else {
        }
        if (token) {
            this.token = token;
            this.tokenParsed = this.decodeToken(token);
            this.sessionId = this.tokenParsed.session_state;
            this.authenticated = true;
            this.realmAccess = this.tokenParsed.realm_access;
            this.resourceAccess = this.tokenParsed.resource_access;
            if (timeLocal) {
                this.timeSkew = Math.floor(timeLocal / 1000) - this.tokenParsed.iat;
            }
            if (this.timeSkew != null) {
                console.log("[OAUTH2] A diferença de tempo estimada entre navegador e servidor é " +
                    this.timeSkew +
                    "segundos");
                if (this.userConfig.onTokenExpired) {
                    var expiresIn = (this.tokenParsed["exp"] -
                        new Date().getTime() / 1000 +
                        this.timeSkew) *
                        1000;
                    console.log("[OAUTH2] Token expira " + Math.round(expiresIn / 1000) + " s");
                    if (expiresIn <= 0) {
                        this.userConfig.onTokenExpired();
                    }
                    else {
                        this.userConfig.tokenTimeoutHandle = setTimeout(this.userConfig.onTokenExpired, expiresIn);
                    }
                }
            }
        }
        else {
            this.token = undefined;
            this.tokenParsed = undefined;
            this.realmAccess = undefined;
            this.resourceAccess = undefined;
            this.authenticated = false;
        }
    }
    getRole() {
        if (this.resourceAccess) {
            if (this.resourceAccess[this.userConfig.realm].roles &&
                this.resourceAccess[this.userConfig.realm].roles.length > 0) {
                return this.resourceAccess[this.userConfig.realm].roles[0];
            }
        }
        return "";
    }
    decodeToken(str) {
        str = str.split(".")[1];
        str = str.replace(/-/g, "+");
        str = str.replace(/_/g, "/");
        switch (str.length % 4) {
            case 0:
                break;
            case 2:
                str += "==";
                break;
            case 3:
                str += "=";
                break;
            default:
                throw new Error("Invalid token");
        }
        str = decodeURIComponent(escape((0, universal_base64_1.decode)(str)));
        str = JSON.parse(str);
        return str;
    }
    updateToken(minValidity, successCallback, errorCallback) {
        minValidity = minValidity || 5;
        var refreshToken = false;
        if (minValidity === -1) {
            refreshToken = true;
            console.log("[OAUTH2] Token refresh: refresh forçado");
        }
        else if (!this.tokenParsed || this.isTokenExpired(minValidity)) {
            refreshToken = true;
            console.log("[OAUTH2] Token refresh: o token expirou");
        }
        if (!refreshToken) {
            successCallback && successCallback(this.tokenParsed);
        }
        else {
            var data = qs_1.default.stringify({
                client_id: this.userConfig.clientId,
                grant_type: "refresh_token",
                refresh_token: this.refreshToken,
                client_secret: this.userConfig.clientSecret,
            });
            var config = {
                method: "post",
                url: `${this.userConfig.url}/realms/${this.userConfig.realm}/protocol/openid-connect/token`,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data: data,
            };
            var timeLocal = new Date().getTime();
            (0, axios_1.default)(config)
                .then((response) => {
                console.log("[OAUTH2] Token atualizado.");
                timeLocal = (timeLocal + new Date().getTime()) / 2;
                var tokenResponse = JSON.parse(response.data);
                this.setToken(tokenResponse["access_token"], tokenResponse["refresh_token"], tokenResponse["id_token"], timeLocal);
                successCallback &&
                    successCallback({
                        id: this.getId(),
                        userName: this.getUsername(),
                        token: tokenResponse,
                        name: this.getName(),
                        fullName: this.getFullName(),
                        email: this.getEmail(),
                        avatar: this.getAvatar(),
                        company: this.getCompany(),
                        owner: this.getOwner(),
                        role: this.getRole(),
                        store: this.getStore(),
                        userSystem: this.getUserSystem(),
                    });
            })
                .catch((error) => {
                errorCallback && errorCallback((0, AnterosErrorMessageHelper_1.processErrorMessage)(error));
            });
        }
    }
    getStore() {
        return this.store;
    }
    setStore(store) {
        this.store = store;
    }
    getCompany() {
        return this.company;
    }
    setCompany(company) {
        this.company = company;
    }
    getUserSystem() {
        return this.userSystem;
    }
    setUserSystem(user) {
        this.userSystem = user;
    }
    getOwner() {
        return this.owner;
    }
    setOwner(owner) {
        this.owner = owner;
    }
    getUsername() {
        return this.tokenParsed.preferred_username;
    }
    getEmail() {
        return this.tokenParsed.email;
    }
    getAvatar() {
        return this.tokenParsed.avatar;
    }
    getName() {
        return this.tokenParsed.given_name;
    }
    getId() {
        return this.tokenParsed.sid;
    }
    getSessionId() {
        return this.sessionId;
    }
    getFullName() {
        return this.tokenParsed.name;
    }
    hasRealmRole(role) {
        var access = this.realmAccess;
        return !!access && access.roles.indexOf(role) >= 0;
    }
    hasResourceRole(role, resource) {
        if (!this.resourceAccess) {
            return false;
        }
        var access = this.resourceAccess[resource || this.userConfig.clientId];
        return !!access && access.roles.indexOf(role) >= 0;
    }
    clearToken() {
        this.setToken(undefined, undefined, undefined, 0);
        this.userConfig.onAuthLogout && this.userConfig.onAuthLogout();
    }
    isTokenExpired(minValidity) {
        if (!this.tokenParsed || !this.refreshToken) {
            throw new Error("Não autenticado");
        }
        if (this.timeSkew == null) {
            console.log("Incapaz de determinar se o token expirou à medida que o tempo não está definido");
            return true;
        }
        var expiresIn = this.tokenParsed["exp"] -
            Math.ceil(new Date().getTime() / 1000) +
            this.timeSkew;
        if (minValidity) {
            if (isNaN(minValidity)) {
                throw new Error("Inválido minValidity");
            }
            expiresIn -= minValidity;
        }
        return expiresIn < 0;
    }
}
exports.AnterosKeycloakUserService = AnterosKeycloakUserService;


/***/ }),

/***/ "@anterostecnologia/anteros-react-core":
/*!********************************************************!*\
  !*** external "@anterostecnologia/anteros-react-core" ***!
  \********************************************************/
/***/ ((module) => {

module.exports = require("@anterostecnologia/anteros-react-core");

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

module.exports = require("axios");

/***/ }),

/***/ "crypto-js":
/*!****************************!*\
  !*** external "crypto-js" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("crypto-js");

/***/ }),

/***/ "qs":
/*!*********************!*\
  !*** external "qs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("qs");

/***/ }),

/***/ "regenerator-runtime/runtime":
/*!**********************************************!*\
  !*** external "regenerator-runtime/runtime" ***!
  \**********************************************/
/***/ ((module) => {

module.exports = require("regenerator-runtime/runtime");

/***/ }),

/***/ "universal-base64":
/*!***********************************!*\
  !*** external "universal-base64" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("universal-base64");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.POST = exports.PUTCH = exports.GET = exports.DELETE = exports.processDetailErrorMessage = exports.processErrorMessage = exports.UserConfig = exports.ApiConfiguration = exports.AnterosKeycloakUserService = exports.AnterosApiClient = exports.AnterosEntity = exports.AnterosRemoteResource = exports.makeDefaultReduxActions = exports.makeDefaultReduxObject = exports.initialState = exports.createReducer = void 0;
const AnterosRemoteApi_1 = __webpack_require__(/*! ./AnterosRemoteApi */ "./src/AnterosRemoteApi.ts");
Object.defineProperty(exports, "AnterosApiClient", ({ enumerable: true, get: function () { return AnterosRemoteApi_1.AnterosAxiosApiClient; } }));
Object.defineProperty(exports, "ApiConfiguration", ({ enumerable: true, get: function () { return AnterosRemoteApi_1.ApiConfiguration; } }));
const AnterosUserService_1 = __webpack_require__(/*! ./AnterosUserService */ "./src/AnterosUserService.ts");
Object.defineProperty(exports, "UserConfig", ({ enumerable: true, get: function () { return AnterosUserService_1.UserConfig; } }));
Object.defineProperty(exports, "AnterosKeycloakUserService", ({ enumerable: true, get: function () { return AnterosUserService_1.AnterosKeycloakUserService; } }));
const AnterosReduxHelper_1 = __webpack_require__(/*! ./AnterosReduxHelper */ "./src/AnterosReduxHelper.ts");
Object.defineProperty(exports, "createReducer", ({ enumerable: true, get: function () { return AnterosReduxHelper_1.createReducer; } }));
Object.defineProperty(exports, "initialState", ({ enumerable: true, get: function () { return AnterosReduxHelper_1.initialState; } }));
Object.defineProperty(exports, "makeDefaultReduxObject", ({ enumerable: true, get: function () { return AnterosReduxHelper_1.makeDefaultReduxObject; } }));
Object.defineProperty(exports, "makeDefaultReduxActions", ({ enumerable: true, get: function () { return AnterosReduxHelper_1.makeDefaultReduxActions; } }));
const AnterosEntity_1 = __webpack_require__(/*! ./AnterosEntity */ "./src/AnterosEntity.ts");
Object.defineProperty(exports, "AnterosEntity", ({ enumerable: true, get: function () { return AnterosEntity_1.AnterosEntity; } }));
const AnterosRemoteResource_1 = __webpack_require__(/*! ./AnterosRemoteResource */ "./src/AnterosRemoteResource.ts");
Object.defineProperty(exports, "AnterosRemoteResource", ({ enumerable: true, get: function () { return AnterosRemoteResource_1.AnterosRemoteResource; } }));
Object.defineProperty(exports, "DELETE", ({ enumerable: true, get: function () { return AnterosRemoteResource_1.DELETE; } }));
Object.defineProperty(exports, "POST", ({ enumerable: true, get: function () { return AnterosRemoteResource_1.POST; } }));
Object.defineProperty(exports, "PUTCH", ({ enumerable: true, get: function () { return AnterosRemoteResource_1.PUTCH; } }));
Object.defineProperty(exports, "GET", ({ enumerable: true, get: function () { return AnterosRemoteResource_1.GET; } }));
const AnterosErrorMessageHelper_1 = __webpack_require__(/*! ./AnterosErrorMessageHelper */ "./src/AnterosErrorMessageHelper.ts");
Object.defineProperty(exports, "processErrorMessage", ({ enumerable: true, get: function () { return AnterosErrorMessageHelper_1.processErrorMessage; } }));
Object.defineProperty(exports, "processDetailErrorMessage", ({ enumerable: true, get: function () { return AnterosErrorMessageHelper_1.processDetailErrorMessage; } }));

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=anteros-react-api2.js.map