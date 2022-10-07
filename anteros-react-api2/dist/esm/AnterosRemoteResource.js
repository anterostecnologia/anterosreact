import { AnterosJacksonParser } from "@anterostecnologia/anteros-react-core";
import { makeDefaultReduxActions } from "./AnterosReduxHelper";
export const POST = "post";
export const DELETE = "delete";
export const GET = "get";
export const PUTCH = "putch";
export class AnterosRemoteResource {
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
    save(entity) {
        let result = {
            url: `${this.url}${this._resourceName}`,
            method: POST,
            data: AnterosJacksonParser.convertObjectToJson(entity),
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
            method: DELETE,
        };
        result = this.applyOwner(this._userService.getUserData(), result);
        return this.applyCompany(this._userService.getUserData(), result);
    }
    deleteById(id) {
        let result = {
            url: `${this.url}${this._resourceName}${id}`,
            method: DELETE,
        };
        result = this.applyOwner(this._userService.getUserData(), result);
        return this.applyCompany(this._userService.getUserData(), result);
    }
    validate(entity) {
        let result = {
            url: `${this.url}${this._resourceName}validate`,
            method: POST,
            data: AnterosJacksonParser.convertObjectToJson(entity),
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
                method: GET,
            };
        }
        else {
            result = {
                url: `${this._resourceName}${value}?fieldsToForceLazy=${fieldsToForceLazy}`,
                method: GET,
            };
        }
        result = this.applyOwner(this._userService.getUserData(), result);
        return this.applyCompany(this._userService.getUserData(), result);
    }
    findAll(page, size, sort, fieldsToForceLazy = "", _companyId = undefined) {
        let user = this._userService.getUserData();
        let result = {
            url: `${this.url}${this._resourceName}findAll?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`,
            method: GET,
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
            method: POST,
        };
        result = this.applyOwner(this._userService.getUserData(), result);
        return this.applyCompany(this._userService.getUserData(), result);
    }
    findMultipleFields(filter, fields, page, size, sort, fieldsToForceLazy = "") {
        let result = {
            url: `${this.url}${this._resourceName}findMultipleFields?filter=${encodeURIComponent(filter)}&fields=${fields}&page=${page}&size=${size}&sort=${sort}&fieldsToForceLazy=${fieldsToForceLazy}`,
            method: POST,
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
            method: GET,
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
            method: POST,
        };
        return result;
    }
    findMultipleFieldsByRelationShip(field, id, filter, fields, page, size, sort, fieldsToForceLazy = "") {
        let result = {
            url: `${this._resourceName}findMultipleFieldsByRelationShip/${field}/${id}?filter=${encodeURIComponent(filter)}&fields=${fields}&page=${page}&size=${size}&sort=${sort}&fieldsToForceLazy=${fieldsToForceLazy}`,
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
        if (config.method === POST) {
            return this._apiClient.post(config.url, config.data, config);
        }
        else if (config.method === GET) {
            return this._apiClient.get(config.url, config);
        }
        else if (config.method === PUTCH) {
            return this._apiClient.put(config.url, config.data, config);
        }
        else if (config.method === DELETE) {
            return this._apiClient.delete(config.url, config.data, config);
        }
        throw new Error("Configuração inválida " + config);
    }
    buildLookupValue(value, onSuccess, onError, fieldsToForceLazy = "") {
        return new Promise((resolve, reject) => {
            this._apiClient
                .get(this.findOne(value, fieldsToForceLazy))
                .then((response) => {
                let data = AnterosJacksonParser.convertJsonToObject(response);
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
//# sourceMappingURL=AnterosRemoteResource.js.map