"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnterosAxiosApiClient = exports.DatasourceApiAdapter = exports.ApiConfiguration = void 0;
const axios_1 = __importDefault(require("axios"));
require("regenerator-runtime/runtime");
const AnterosErrorMessageHelper_1 = require("./AnterosErrorMessageHelper");
const universal_base64_1 = require("universal-base64");
const qs_1 = __importDefault(require("qs"));
const anteros_react_core_1 = require("@anterostecnologia/anteros-react-core");
var CryptoJS = require("crypto-js");
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
//# sourceMappingURL=AnterosRemoteApi.js.map