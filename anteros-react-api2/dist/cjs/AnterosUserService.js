"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnterosKeycloakUserService = exports.UserConfig = void 0;
const axios_1 = __importDefault(require("axios"));
const universal_base64_1 = require("universal-base64");
const qs_1 = __importDefault(require("qs"));
require("regenerator-runtime/runtime");
const AnterosErrorMessageHelper_1 = require("./AnterosErrorMessageHelper");
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
//# sourceMappingURL=AnterosUserService.js.map