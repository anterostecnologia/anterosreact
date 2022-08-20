import { AxiosInstance } from "axios";
import "regenerator-runtime/runtime";
import { IAnterosUserService, SuccessCallback, ErrorCallback, UserData } from "./AnterosUserService";
export declare type HttpHeaders = {
    [key: string]: string;
};
export declare type RequestConfig = {
    headers: HttpHeaders;
};
export declare class ApiConfiguration {
    urlBase?: string;
    credentials?: Object;
}
export interface IAnterosApiClient {
    getConfiguration(): ApiConfiguration;
    getClient(): any;
    applyAuthorization(config: any): any;
    post<TRequest, TResponse>(url: string, data: TRequest, config?: RequestConfig): Promise<TResponse>;
    patch<TRequest, TResponse>(url: string, data: TRequest): Promise<TResponse>;
    put<TRequest, TResponse>(url: string, data: TRequest, config?: RequestConfig): Promise<TResponse>;
    get<TResponse>(url: string): Promise<TResponse>;
    delete<TRequest, TResponse>(url: string, data: TRequest): Promise<TResponse>;
}
export declare class DatasourceApiAdapter {
    private _apiClient;
    constructor(apiClient: any);
    save(config: any): any;
    delete(config: any): any;
    get(config: any): any;
}
export declare class AnterosAxiosApiClient implements IAnterosApiClient, SuccessCallback, ErrorCallback {
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
    patch<TRequest, TResponse>(path: string, payload: TRequest): Promise<TResponse>;
    put<TRequest, TResponse>(path: string, payload: TRequest): Promise<TResponse>;
    delete<TRequest, TResponse>(path: string, payload: TRequest): Promise<TResponse>;
    get<TResponse>(path: string): Promise<TResponse>;
    setCredentials(credentials: any): IAnterosApiClient;
    setBaseURL(urlBase: string): IAnterosApiClient;
}
