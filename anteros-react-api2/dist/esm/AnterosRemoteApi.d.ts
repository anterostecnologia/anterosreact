import { AxiosInstance } from "axios";
import "regenerator-runtime/runtime";
import { IAnterosUserService, UserData } from "./AnterosUserService";
export declare type HttpHeaders = {
    [key: string]: string;
};
export declare type RequestConfig = {
    headers: HttpHeaders;
};
export declare class ApiConfiguration {
    private _urlBase;
    private _secretKey;
    private _urlSaaS?;
    private _credentials?;
    private _localStorage?;
    constructor(urlBase: string, secretKey: string, localStorage: any, urlSaaS?: string);
    /**
     * Getter urlBase
     * @return {string}
     */
    get urlBase(): string;
    /**
     * Getter secretKey
     * @return {string}
     */
    get secretKey(): string;
    /**
     * Setter urlBase
     * @param {string} value
     */
    set urlBase(value: string);
    /**
     * Setter secretKey
     * @param {string} value
     */
    set secretKey(value: string);
    /**
     * Getter urlSaaS
     * @return {string}
     */
    get urlSaaS(): string | undefined;
    /**
     * Getter credentials
     * @return {Object}
     */
    get credentials(): Object | undefined;
    /**
     * Getter localStorage
     * @return {any}
     */
    get localStorage(): any;
    /**
     * Setter urlSaaS
     * @param {string} value
     */
    set urlSaaS(value: string | undefined);
    /**
     * Setter credentials
     * @param {Object} value
     */
    set credentials(value: Object | undefined);
    /**
     * Setter localStorage
     * @param {any} value
     */
    set localStorage(value: any);
}
export interface IAnterosApiClient {
    getConfiguration(): ApiConfiguration;
    getClient(): any;
    applyAuthorization(config: any): any;
    post<TRequest, TResponse>(url: string, data: TRequest, config?: RequestConfig): Promise<TResponse>;
    patch<TRequest, TResponse>(url: string, data: TRequest, config?: RequestConfig): Promise<TResponse>;
    put<TRequest, TResponse>(url: string, data: TRequest, config?: RequestConfig): Promise<TResponse>;
    get<TResponse>(url: string, config?: RequestConfig): Promise<TResponse>;
    delete<TRequest, TResponse>(url: string, data: TRequest, config?: RequestConfig): Promise<TResponse>;
    getSavedUserInformation(credentials: any): any;
    getSavedEndpointInformation(credentials: any): any;
    getUserInformation(credentials: any, ownerUrl: any, onError: any, onSuccess: any): any;
    clear(credentials: any): any;
    updateEndpointInformation(credentials: any, endpoints: any): any;
    updateOwnerInfo(credentials: any, owner: any): any;
    validateOwner(credentials: any, onError: any, onSuccess: any): any;
    getQueryOwners(owners: any, onError: any, onSuccess: any): any;
    getQueryOwnersByUser(user: any, onError: any, onSuccess: any): any;
    getOwnerInfo(credentials: any, profile: any, ownerUrl: any, onError: any, onSuccess: any, tryCount: any): any;
}
export declare class DatasourceApiAdapter {
    private _apiClient;
    constructor(apiClient: any);
    save(config: any): any;
    delete(config: any): any;
    get(config: any): any;
}
export declare class AnterosAxiosApiClient implements IAnterosApiClient {
    private client;
    private apiConfiguration;
    private userService;
    constructor(apiConfiguration: ApiConfiguration, userService: IAnterosUserService);
    getClient(): AxiosInstance;
    getConfiguration(): ApiConfiguration;
    onSuccess(_userData: UserData): void;
    onError(error: string): void;
    protected createAxiosClient(apiConfiguration: ApiConfiguration): AxiosInstance;
    private getOptions;
    applyAuthorization(config: any): any;
    private configureRequest;
    private getAuthorizationHeader;
    post<TRequest, TResponse>(path: string, payload: TRequest, config?: RequestConfig): Promise<TResponse>;
    patch<TRequest, TResponse>(path: string, payload: TRequest, config?: RequestConfig): Promise<TResponse>;
    put<TRequest, TResponse>(path: string, payload: TRequest, config?: RequestConfig): Promise<TResponse>;
    delete<TRequest, TResponse>(path: string, payload: TRequest, config?: RequestConfig): Promise<TResponse>;
    get<TResponse>(path: string, config?: any): Promise<TResponse>;
    setCredentials(credentials: any): IAnterosApiClient;
    setBaseURL(urlBase: string): IAnterosApiClient;
    getSavedUserInformation(credentials: any): {} | undefined;
    getSavedEndpointInformation(credentials: any): {} | undefined;
    getUserInformation(credentials: any, ownerUrl: any, onError: any, onSuccess: any): Promise<unknown>;
    clear(credentials: any): void;
    updateEndpointInformation(credentials: any, endpoints: any): void;
    updateOwnerInfo(credentials: any, owner: any): void;
    _getUserInformation(credentials: any, ownerUrl: any, onError: any, onSuccess: any, tryCount?: number): Promise<unknown>;
    validateOwner(credentials: any, onError: any, onSuccess: any): Promise<unknown>;
    getQueryOwners(owners: any, onError: any, onSuccess: any): Promise<unknown>;
    getQueryOwnersByUser(user: any, onError: any, onSuccess: any): Promise<unknown>;
    getOwnerInfo(credentials: any, profile: any, ownerUrl: any, onError: any, onSuccess: any, tryCount?: number): Promise<unknown>;
    getSecretKey(): string;
    encryptWithCryptoJS(plainText: any): string;
    decryptionWithCryptoJS(cipher: any): any;
}
