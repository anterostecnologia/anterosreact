import { AnterosEntity } from "./AnterosEntity";
import { IAnterosApiClient } from "./AnterosRemoteApi";
import { AnterosJacksonParser } from "@anterostecnologia/anteros-react-core";
import { IAnterosUserService } from "./AnterosUserService";
import { AxiosRequestConfig } from "axios";
import { makeDefaultReduxActions } from "./AnterosReduxHelper";
export const POST = "post";
export const DELETE = "delete";
export const GET = "get";
export const PUTCH = "putch";

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
  delete(entity): any;
  deleteById(id: TypeID): any;
  validate(entity: T): any;
  findOne(value: any, fieldsToForceLazy: string): any;
  findAll(
    page: number,
    size: number,
    sort: string,
    fieldsToForceLazy: string,
    companyId: any | undefined
  ): any;
  findWithFilter(
    data: any,
    page: number,
    size: number,
    fieldsToForceLazy: string
  ): any;
  findMultipleFields(
    filter: string,
    fields: string,
    page: number,
    size: number,
    sort: string,
    fieldsToForceLazy: string
  ): any;
  findAllByRelationShip(
    field: string,
    id: any,
    page: number,
    size: number,
    sort: string,
    fieldsToForceLazy: string
  ): any;
  findWithFilterByRelationShip(
    field: string,
    id: any,
    filter: any,
    page: number,
    size: number,
    fieldsToForceLazy: string
  ): any;
  findMultipleFieldsByRelationShip(
    field: string,
    id: any,
    filter: string,
    fields: string,
    page: number,
    size: number,
    sort: string,
    fieldsToForceLazy: string
  ): any;
  buildLookupValue(value, onSuccess, onError, fieldsToForceLazy): Promise<any>;
  execute(config: any): Promise<any>;
}

export abstract class AnterosRemoteResource<T extends AnterosEntity, TypeID>
  implements IAnterosRemoteResource<T, TypeID>
{
  private _apiClient: IAnterosApiClient;
  private _reducerName: string;
  private _searchReducerName: string;
  private _resourceName: string;
  private _userService: IAnterosUserService;
  private _useCode: boolean = false;
  private _url: string | undefined;

  constructor(
    reducerName: string,
    resourceName: string,
    apiClient: IAnterosApiClient,
    userService: IAnterosUserService,
    url: string | undefined,
    searchReducerName: string | undefined
  ) {
    this._apiClient = apiClient;
    this._reducerName = reducerName;
    this._resourceName = resourceName;
    this._userService = userService;
    this._url = url;
    this._searchReducerName = searchReducerName ?? reducerName;
  }

  getFieldNameID() {
    return "id";
  }

  getApiClient(): IAnterosApiClient {
    return this._apiClient;
  }

  setApiClient(apiClient: IAnterosApiClient): void {
    this._apiClient = apiClient;
  }

  getReducerName(): string {
    return this._reducerName;
  }

  setReducerName(reducerName: string): void {
    this._resourceName = reducerName;
  }

  getSearchReducerName(): string {
    return this._searchReducerName;
  }

  setSearchReducerName(searchReducerName: string): void {
    this._searchReducerName = searchReducerName;
  }

  getResourceName(): string {
    return this._resourceName;
  }

  setResourceName(resourceName: string): void {
    this._resourceName = resourceName;
  }

  getUseCode(): boolean {
    return this._useCode;
  }

  setUseCode(useCode: boolean): void {
    this._useCode = useCode;
  }

  get userService() {
    return this._userService;
  }

  public getCustomActions(): any | undefined {}
  public getCustomSearchActions(): any | undefined {}

  get searchActions() {
    const customSearchActions = this.getCustomSearchActions();
    if (customSearchActions) {
      return customSearchActions;
    }
    return makeDefaultReduxActions(`${this._reducerName.toUpperCase()}_SEARCH`);
  }

  get actions() {
    const customActions = this.getCustomActions();
    if (customActions) {
      return customActions;
    }

    return makeDefaultReduxActions(`${this._reducerName.toUpperCase()}`);
  }

  get url() {
    if (!this._url) {
      return this._apiClient.getConfiguration().urlBase + "/";
    }
    return this._url + "/";
  }

  save(entity: T) {
    let result: AxiosRequestConfig = {
      url: `${this.url}${this._resourceName}`,
      method: POST,
      data: AnterosJacksonParser.convertObjectToJson(entity),
      headers: {},
    };
    let user = this._userService.getUserData();
    result = this.applyOwner(this._userService.getUserData(), result);
    if (user && user.company) {
      result = {
        ...result,
        headers: {
          ...result.headers,
          "X-Company-ID": user.company.id,
        },
      };
    } else if (entity.hasOwnProperty("cdEmpresa") && entity["cdEmpresa"]) {
      result = {
        ...result,
        headers: {
          ...result.headers,
          "X-Company-ID": entity["cdEmpresa"],
        },
      };
    }
    return result;
  }

  delete(entity: T) {
    let result: AxiosRequestConfig = {
      url: `${this.url}${this._resourceName}${entity[this.getFieldNameID()]}`,
      method: DELETE,
    };
    result = this.applyOwner(this._userService.getUserData(), result);
    return this.applyCompany(this._userService.getUserData(), result);
  }

  deleteById(id: TypeID) {
    let result: AxiosRequestConfig = {
      url: `${this.url}${this._resourceName}${id}`,
      method: DELETE,
    };
    result = this.applyOwner(this._userService.getUserData(), result);
    return this.applyCompany(this._userService.getUserData(), result);
  }

  validate(entity: T) {
    let result: AxiosRequestConfig = {
      url: `${this.url}${this._resourceName}validate`,
      method: POST,
      data: AnterosJacksonParser.convertObjectToJson(entity),
    };
    result = this.applyOwner(this._userService.getUserData(), result);
    return this.applyCompany(this._userService.getUserData(), result);
  }

  findOne(value: any, fieldsToForceLazy: string = ""): any {
    let result;
    let user = this._userService.getUserData();
    if (user && user.owner && this._useCode === true) {
      result = {
        url: `${this._resourceName}code/${value}?fieldsToForceLazy=${fieldsToForceLazy}`,
        method: GET,
      };
    } else {
      result = {
        url: `${this._resourceName}${value}?fieldsToForceLazy=${fieldsToForceLazy}`,
        method: GET,
      };
    }
    result = this.applyOwner(this._userService.getUserData(), result);
    return this.applyCompany(this._userService.getUserData(), result);
  }

  findAll(
    page: number,
    size: number,
    sort: string,
    fieldsToForceLazy: string = "",
    _companyId: any | undefined = undefined
  ) {
    let user = this._userService.getUserData();
    let result: AxiosRequestConfig = {
      url: `${this.url}${this._resourceName}findAll?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`,
      method: GET,
      headers: {},
    };
    this.applySort(sort, result);
    result = this.applyOwner(user, result);
    return this.applyCompany(this._userService.getUserData(), result);
  }

  findWithFilter(
    data: any,
    page: number,
    size: number,
    fieldsToForceLazy: string = ""
  ) {
    let result: AxiosRequestConfig = {
      url: `${this.url}${this._resourceName}findWithFilter?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`,
      data: data,
      method: POST,
    };
    result = this.applyOwner(this._userService.getUserData(), result);
    return this.applyCompany(this._userService.getUserData(), result);
  }

  findMultipleFields(
    filter: string,
    fields: string,
    page: number,
    size: number,
    sort: string,
    fieldsToForceLazy: string = ""
  ) {
    let result = {
      url: `${this.url}${
        this._resourceName
      }findMultipleFields?filter=${encodeURIComponent(
        filter
      )}&fields=${fields}&page=${page}&size=${size}&sort=${sort}&fieldsToForceLazy=${fieldsToForceLazy}`,
      method: POST,
    };
    result = this.applyOwner(this._userService.getUserData(), result);
    return this.applyCompany(this._userService.getUserData(), result);
  }

  findAllByRelationShip(
    field: string,
    id: any,
    page: number,
    size: number,
    sort: string,
    fieldsToForceLazy: string = ""
  ) {
    let url = `${this._resourceName}findAllByRelationShip/${field}/${id}?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`;
    if (sort && sort.length > 0) {
      url += `&sort=${sort}`;
    }

    let result1: AxiosRequestConfig = {
      url,
      method: GET,
    };
    let user = this._userService.getUserData();

    if (user && user.owner) {
      result1 = {
        ...result1,
        headers: {
          "X-Tenant-ID": user.owner,
          "X-Company-ID": user.company.id,
        },
      };
    }
    return result1;
  }

  findWithFilterByRelationShip(
    field: string,
    id: any,
    filter: any,
    page: number,
    size: number,
    fieldsToForceLazy: string = ""
  ) {
    let result = {
      url: `${this._resourceName}findWithFilterByRelationShip/${field}/${id}?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`,
      data: filter,
      method: POST,
    };
    return result;
  }

  findMultipleFieldsByRelationShip(
    field: string,
    id: any,
    filter: string,
    fields: string,
    page: number,
    size: number,
    sort: string,
    fieldsToForceLazy: string = ""
  ) {
    let result = {
      url: `${
        this._resourceName
      }findMultipleFieldsByRelationShip/${field}/${id}?filter=${encodeURIComponent(
        filter
      )}&fields=${fields}&page=${page}&size=${size}&sort=${sort}&fieldsToForceLazy=${fieldsToForceLazy}`,
      method: POST,
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
      result = {
        ...result,
        headers: {
          ...result.headers,
          "X-Company-ID": user.company.id,
        },
      };
    }
    if (user && user.store) {
      result = {
        ...result,
        headers: {
          ...result.headers,
          "X-Company-ID": user.store.company.id,
        },
      };
    }
    return result;
  }

  applyOwner(user, result) {
    if (user && user.owner) {
      result = {
        ...result,
        headers: {
          "X-Tenant-ID": user.owner,
        },
      };
    }
    return result;
  }

  execute(config: any): Promise<any> {
    if (config.method === POST) {
      return this._apiClient.post<any, any>(config.url, config.data, config);
    } else if (config.method === GET) {
      return this._apiClient.get<any>(config.url, config);
    } else if (config.method === PUTCH) {
      return this._apiClient.put<any, any>(config.url, config.data, config);
    } else if (config.method === DELETE) {
      return this._apiClient.delete<any, any>(config.url, config.data, config);
    }
    throw new Error("Configuração inválida " + config);
  }

  buildLookupValue(
    value,
    onSuccess,
    onError,
    fieldsToForceLazy = ""
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this._apiClient
        .get(this.findOne(value, fieldsToForceLazy))
        .then((data: any) => {
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
