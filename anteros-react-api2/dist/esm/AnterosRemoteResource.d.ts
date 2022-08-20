import { AnterosEntity } from "./AnterosEntity";
import { IAnterosApiClient } from "./index.js";
import { IAnterosUserService } from "./AnterosUserService";
import { AxiosRequestConfig } from "axios";
export declare const POST = "post";
export declare const DELETE = "delete";
export declare const GET = "get";
export declare const PUTCH = "putch";
export interface IAnterosRemoteResource<T extends AnterosEntity, TypeID> {
    actions: any;
    searchActions: any;
    getApiClient(): IAnterosApiClient;
    setApiClient(apiClient: IAnterosApiClient): void;
    getResourceName(): string;
    setResourceName(resourceName: string): void;
    getReducerName(): string;
    setReducerName(reducerName: string): void;
    getSearchReducerName(): string;
    setSearchReducerName(searchReducerName: string): void;
    getUseCode(): boolean;
    setUseCode(useCode: boolean): void;
    save(entity: T): any;
    delete(entity: any): any;
    deleteById(id: TypeID): any;
    validate(entity: T): any;
    findOne(value: any, fieldsToForceLazy: string): any;
    findAll(page: number, size: number, sort: string, fieldsToForceLazy: string, companyId: any | undefined): any;
    findWithFilter(data: any, page: number, size: number, fieldsToForceLazy: string): any;
    findMultipleFields(filter: string, fields: string, page: number, size: number, sort: string, fieldsToForceLazy: string): any;
    findAllByRelationShip(field: string, id: any, page: number, size: number, sort: string, fieldsToForceLazy: string): any;
    findWithFilterByRelationShip(field: string, id: any, filter: any, page: number, size: number, fieldsToForceLazy: string): any;
    findMultipleFieldsByRelationShip(field: string, id: any, filter: string, fields: string, page: number, size: number, sort: string, fieldsToForceLazy: string): any;
    buildLookupValue(value: any, onSuccess: any, onError: any, fieldsToForceLazy: any): any;
}
export declare class AnterosRemoteResource<T extends AnterosEntity, TypeID> implements IAnterosRemoteResource<T, TypeID> {
    private _apiClient;
    private _reducerName;
    private _searchReducerName;
    private _resourceName;
    private _userService;
    private _useCode;
    private _url;
    constructor(reducerName: string, resourceName: string, apiClient: IAnterosApiClient, userService: IAnterosUserService, url: string | undefined, searchReducerName: string | undefined);
    getFieldNameID(): string;
    getApiClient(): IAnterosApiClient;
    setApiClient(apiClient: IAnterosApiClient): void;
    getReducerName(): string;
    setReducerName(reducerName: string): void;
    getSearchReducerName(): string;
    setSearchReducerName(searchReducerName: string): void;
    getResourceName(): string;
    setResourceName(resourceName: string): void;
    getUseCode(): boolean;
    setUseCode(useCode: boolean): void;
    get userService(): IAnterosUserService;
    get searchActions(): {
        setDatasource(dataSource: any): {
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
    get actions(): {
        setDatasource(dataSource: any): {
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
    get url(): string;
    save(entity: T): AxiosRequestConfig<any>;
    delete(entity: T): any;
    deleteById(id: TypeID): any;
    validate(entity: T): any;
    findOne(value: any, fieldsToForceLazy?: string): any;
    findAll(page: number, size: number, sort: string, fieldsToForceLazy?: string, _companyId?: any | undefined): any;
    findWithFilter(data: any, page: number, size: number, fieldsToForceLazy?: string): any;
    findMultipleFields(filter: string, fields: string, page: number, size: number, sort: string, fieldsToForceLazy?: string): any;
    findAllByRelationShip(field: string, id: any, page: number, size: number, sort: string, fieldsToForceLazy?: string): AxiosRequestConfig<any>;
    findWithFilterByRelationShip(field: string, id: any, filter: any, page: number, size: number, fieldsToForceLazy?: string): {
        url: string;
        data: any;
        method: string;
    };
    findMultipleFieldsByRelationShip(field: string, id: any, filter: string, fields: string, page: number, size: number, sort: string, fieldsToForceLazy?: string): {
        url: string;
        method: string;
    };
    applySort(sort: any, result: any): void;
    applyCompany(user: any, result: any): any;
    applyOwner(user: any, result: any): any;
    execute(config: any): Promise<any>;
    buildLookupValue(value: any, onSuccess: any, onError: any, fieldsToForceLazy?: string): Promise<unknown>;
}
