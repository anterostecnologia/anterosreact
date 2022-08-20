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
class ApiConfiguration {
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
                        yield this.userService.updateToken(5, this, this);
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
    patch(path, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.patch(path, payload);
                return response.data;
            }
            catch (error) {
                return new Promise(() => {
                    throw new Error((0, AnterosErrorMessageHelper_1.processErrorMessage)(error));
                });
            }
        });
    }
    put(path, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.put(path, payload);
                return response.data;
            }
            catch (error) {
                return new Promise(() => {
                    throw new Error((0, AnterosErrorMessageHelper_1.processErrorMessage)(error));
                });
            }
        });
    }
    delete(path, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.delete(path, payload);
                return response.data;
            }
            catch (error) {
                handleServiceError(error);
            }
            return {};
        });
    }
    get(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(path);
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
}
exports.AnterosAxiosApiClient = AnterosAxiosApiClient;
//# sourceMappingURL=AnterosRemoteApi.js.map