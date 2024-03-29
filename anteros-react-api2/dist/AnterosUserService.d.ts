import "regenerator-runtime/runtime";
export declare class UserConfig {
    private _url;
    private _realm;
    private _clientId;
    private _clientSecret;
    private _tokenTimeoutHandle?;
    private _onAuthError?;
    private _onAuthLogout?;
    private _onAuthLogin?;
    private _onAuthRefreshSuccess?;
    private _onAuthRefreshError?;
    private _onTokenExpired?;
    private _owner;
    private _localStorage;
    private _secretKey;
    constructor(url: string, realm: string, clientId: string, clientSecret: string, owner: any, localStorage: any, secretKey: string, tokenTimeoutHandle?: number, onAuthError?: Function, onAuthLogout?: Function, onAuthLogin?: Function, onAuthRefreshSuccess?: Function, onAuthRefreshError?: Function, onTokenExpired?: Function);
    /**
     * Getter url
     * @return {string}
     */
    get url(): string;
    /**
     * Getter realm
     * @return {string}
     */
    get realm(): string;
    /**
     * Getter clientId
     * @return {string}
     */
    get clientId(): string;
    /**
     * Getter clientSecret
     * @return {string}
     */
    get clientSecret(): string;
    /**
     * Getter tokenTimeoutHandle
     * @return {number}
     */
    get tokenTimeoutHandle(): number | undefined;
    /**
     * Getter onAuthError
     * @return {Function}
     */
    get onAuthError(): Function | undefined;
    /**
     * Getter onAuthLogout
     * @return {Function}
     */
    get onAuthLogout(): Function | undefined;
    /**
     * Getter onAuthLogin
     * @return {Function}
     */
    get onAuthLogin(): Function | undefined;
    /**
     * Getter onAuthRefreshSuccess
     * @return {Function}
     */
    get onAuthRefreshSuccess(): Function | undefined;
    /**
     * Getter onAuthRefreshError
     * @return {Function}
     */
    get onAuthRefreshError(): Function | undefined;
    /**
     * Getter onTokenExpired
     * @return {Function}
     */
    get onTokenExpired(): Function | undefined;
    /**
     * Setter url
     * @param {string} value
     */
    set url(value: string);
    /**
     * Setter realm
     * @param {string} value
     */
    set realm(value: string);
    /**
     * Setter clientId
     * @param {string} value
     */
    set clientId(value: string);
    /**
     * Setter clientSecret
     * @param {string} value
     */
    set clientSecret(value: string);
    /**
     * Setter tokenTimeoutHandle
     * @param {number} value
     */
    set tokenTimeoutHandle(value: number | undefined);
    /**
     * Setter onAuthError
     * @param {Function} value
     */
    set onAuthError(value: Function | undefined);
    /**
     * Setter onAuthLogout
     * @param {Function} value
     */
    set onAuthLogout(value: Function | undefined);
    /**
     * Setter onAuthLogin
     * @param {Function} value
     */
    set onAuthLogin(value: Function | undefined);
    /**
     * Setter onAuthRefreshSuccess
     * @param {Function} value
     */
    set onAuthRefreshSuccess(value: Function | undefined);
    /**
     * Setter onAuthRefreshError
     * @param {Function} value
     */
    set onAuthRefreshError(value: Function | undefined);
    /**
     * Setter onTokenExpired
     * @param {Function} value
     */
    set onTokenExpired(value: Function | undefined);
    /**
     * Getter owner
     * @return {string}
     */
    get owner(): any;
    /**
     * Setter owner
     * @param {string} value
     */
    set owner(value: any);
    /**
     * Getter localStorage
     * @return {any}
     */
    get localStorage(): any;
    /**
     * Setter localStorage
     * @param {any} value
     */
    set localStorage(value: any);
    /**
     * Getter secretKey
     * @return {string}
     */
    get secretKey(): string;
    /**
     * Setter secretKey
     * @param {string} value
     */
    set secretKey(value: string);
}
export declare type UserData = {
    id: string;
    userName: string;
    token: string | undefined;
    name: string;
    fullName: string;
    email: string;
    avatar: string | undefined;
    company: any | undefined;
    owner: any | undefined;
    role: string;
    store: any | undefined;
    userSystem: any | undefined;
};
export interface IAnterosUserService {
    login(username: string, password: string, successCallback: Function, errorCallback: Function): any;
    logout(): any;
    isLoggedIn(): boolean;
    clearToken(): any;
    getToken(): string | undefined;
    isTokenExpired(minValidity?: number): boolean;
    updateToken(minValidity: number | undefined, successCallback: Function | undefined, errorCallback: Function | undefined): any;
    getUsername(): string;
    getEmail(): string;
    getName(): string;
    getFullName(): string;
    getAvatar(): string | undefined;
    getId(): string;
    getSessionId(): string | undefined;
    hasRealmRole(role: string): boolean;
    getUserData(): UserData;
    getCompany(): any | undefined;
    setCompany(company: any): void;
    getStore(): any | undefined;
    setStore(store: any): void;
    getOwner(): any | undefined;
    setOwner(owner: any): void;
    getUserSystem(): any | undefined;
    setUserSystem(user: any): void;
}
export declare class AnterosKeycloakUserService implements IAnterosUserService {
    private userConfig;
    private token?;
    private tokenParsed?;
    private refreshToken?;
    private sessionId?;
    private realmAccess?;
    private resourceAccess?;
    private authenticated;
    private timeSkew?;
    private company?;
    private store?;
    private owner?;
    private userSystem?;
    constructor(config: UserConfig);
    getUserData(): UserData;
    login(username: string, password: string, successCallback: Function | undefined, errorCallback: Function | undefined): void;
    logout(): void;
    isLoggedIn(): boolean;
    getToken(): string | undefined;
    setToken(token: string | undefined, refreshToken: string | undefined, idToken: string | undefined, timeLocal: any): void;
    getRole(): any;
    decodeToken(str: any): any;
    updateToken(minValidity: number | undefined, successCallback: Function, errorCallback: Function): void;
    getStore(): any | undefined;
    setStore(store: any): void;
    getCompany(): any | undefined;
    setCompany(company: any): void;
    getUserSystem(): any | undefined;
    setUserSystem(user: any): void;
    getOwner(): any | undefined;
    setOwner(owner: any): void;
    getUsername(): string;
    getEmail(): string;
    getAvatar(): string;
    getName(): string;
    getId(): string;
    getSessionId(): string | undefined;
    getFullName(): string;
    hasRealmRole(role: string): boolean;
    hasResourceRole(role: any, resource: any): boolean;
    clearToken(): void;
    isTokenExpired(minValidity?: number): boolean;
}
