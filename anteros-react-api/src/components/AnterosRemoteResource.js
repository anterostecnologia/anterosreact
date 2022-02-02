import {
    AnterosJacksonParser
} from './AnterosJacksonParser';
import {autoBind} from './AnterosAutoBind';
import {
    makeDefaultReduxActions
} from './AnterosReduxHelper';
import remoteApi from './AnterosRemoteApi';
import 'regenerator-runtime/runtime';
export const POST = 'post';
export const DELETE = 'delete';
export const GET = 'get';


export class AnterosRemoteResource {

    constructor(reducerName, resourceEndPoint, url) {
        this._resourceEndPoint = resourceEndPoint;
        this._url = url;
        this._reducerName = reducerName;
        autoBind(this);
    }

    get name() {
        return this._resourceEndPoint;
    }

    get reducerName() {
        return this._reducerName + "Reducer";
    }

    get searchReducerName() {
        return this._reducerName + "ConsultaReducer";
    }

    get url() {
        if (!this._url) {
            return remoteApi.baseURL + "/";
        }
        return this._url + "/";
    }

    post(resourceName, entity, user) {
        let _resourceName = resourceName;
        if (resourceName instanceof AnterosRemoteResource){
            _resourceName = resourceName.name;
        }
        let result = {
            url: `${this.url}${_resourceName}`,
            method: POST,
            data: AnterosJacksonParser.convertObjectToJson(entity)
        };
        result = this.applyOwner(user, result);
        if (user && user.company) {
            result = {
                ...result,
                headers: {
                    ...result.headers,
                    "X-Company-ID": user.company.id
                }
            }
        } else if (entity.hasOwnProperty('cdEmpresa') && entity.id) {
            result = {
                ...result,
                headers: {
                    ...result.headers,
                    "X-Company-ID": entity.id
                }
            }
        }
        return result;
    }

    delete(resourceName, entity, user) {
        let _resourceName = resourceName;
        if (resourceName instanceof AnterosRemoteResource){
            _resourceName = resourceName.name;
        }
        let result = {
            url: `${this.url}${_resourceName}${entity.id}`,
            method: DELETE
        };
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }

    deleteById(resourceName, id, user) {
        let _resourceName = resourceName;
        if (resourceName instanceof AnterosRemoteResource){
            _resourceName = resourceName.name;
        }
        let result = {
            url: `${this.url}${_resourceName}${id}`,
            method: DELETE
        };
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }

    validate(resourceName, entity, user) {
        let _resourceName = resourceName;
        if (resourceName instanceof AnterosRemoteResource){
            _resourceName = resourceName.name;
        }
        let result = {
            url: `${this.url}${_resourceName}validate`,
            method: POST,
            data: AnterosJacksonParser.convertObjectToJson(entity)
        };
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }

    findOne(resourceName, value, user, fieldsToForceLazy = "") {
        let _resourceName = resourceName;
        if (resourceName instanceof AnterosRemoteResource){
            _resourceName = resourceName.name;
        }
        let result;
        if (user && user.owner && user.owner.boUtilizaCode === true) {
            result = {
                url: `${_resourceName}code/${value}?fieldsToForceLazy=${fieldsToForceLazy}`,
                method: GET
            }
        } else {
            result = {
                url: `${_resourceName}${value}?fieldsToForceLazy=${fieldsToForceLazy}`,
                method: GET
            };
        }
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }



    findAll(resourceName, page, size, sort, user, fieldsToForceLazy = "", empresaId = undefined) {
        let _resourceName = resourceName;
        if (resourceName instanceof AnterosRemoteResource){
            _resourceName = resourceName.name;
        }
        let result = {
            url: `${this.url}${_resourceName}findAll?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`,
            method: GET
        };
        this.applySort(sort, result);
        result = this.applyOwner(user, result);
        if (user && user.company && user.company.id) {
            result = {
                ...result,
                headers: {
                    ...result.headers,
                    "X-Company-ID": user.company.id
                }
            }
        } else if (empresaId) {
            result = {
                ...result,
                headers: {
                    ...result.headers,
                    "X-Company-ID": empresaId
                }
            }
        }
        return result;
    }

    findWithFilter(resourceName, data, page, size, user, fieldsToForceLazy = "", status = "ATIVO") {
        let _resourceName = resourceName;
        if (resourceName instanceof AnterosRemoteResource){
            _resourceName = resourceName.name;
        }
        let result = {
            url: `${this.url}${_resourceName}findWithFilter?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`,
            data: data,
            method: POST
        };
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }

    findMultipleFields(
        resourceName,
        filter,
        fields,
        page,
        size,
        sort,
        user,
        fieldsToForceLazy = "",
        status = "ATIVO"
    ) {
        let _resourceName = resourceName;
        if (resourceName instanceof AnterosRemoteResource){
            _resourceName = resourceName.name;
        }
        let result = {
            url: `${this.url}${_resourceName}findMultipleFields?filter=${encodeURIComponent(filter)}&fields=${fields}&page=${page}&size=${size}&sort=${sort}&fieldsToForceLazy=${fieldsToForceLazy}`,
            method: POST
        };
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }

    findAllByRelationShip(resourceName, field, id, page, size, sort, user, fieldsToForceLazy = "") {
        let _resourceName = resourceName;
        if (resourceName instanceof AnterosRemoteResource){
            _resourceName = resourceName.name;
        }
        
        let url = `${_resourceName}findAllByRelationShip/${field}/${id}?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`;
        if(sort && sort.length > 0){
            url += `&sort=${sort}`;
        }

        let result1 = {
            url,
            method: GET
        };
        
        if (user && user.owner) {
            result1 = {
                ...result1,
                headers: {
                    "X-Tenant-ID": user.owner.id,
                    "X-Company-ID": user.company.id
                }
            }
        }
        return result1;
    }

    findWithFilterByRelationShip (resourceName, field, id, filter, page, size, user, fieldsToForceLazy = "") {
        let _resourceName = resourceName;
        if (resourceName instanceof AnterosRemoteResource){
            _resourceName = resourceName.name;
        }
        return {
            url: `${_resourceName}findWithFilterByRelationShip/${field}/${id}?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`,
            data: filter,
            method: POST
        };
    }

    findMultipleFieldsByRelationShip(resourceName, field, id, filter, fields, page, size, sort, user, fieldsToForceLazy = "") {
        let _resourceName = resourceName;
        if (resourceName instanceof AnterosRemoteResource){
            _resourceName = resourceName.name;
        }
        return {
            url: `${_resourceName}findMultipleFieldsByRelationShip/${field}/${id}?filter=${encodeURIComponent(filter)}&fields=${fields}&page=${page}&size=${size}&sort=${sort}&fieldsToForceLazy=${fieldsToForceLazy}`,
            method: POST
        };
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
                    "X-Company-ID": user.company.id
                }
            };
        }
        return result;
    }

    applyOwner(user, result) {
        if (user && user.owner) {
            result = {
                ...result,
                headers: {
                    "X-Tenant-ID": user.owner.id
                }
            };
        }
        return result;
    }

    get searchActions() {
        return makeDefaultReduxActions(`${this._reducerName.toUpperCase()}_SEARCH`);
    }

    get actions() {
        return makeDefaultReduxActions(`${this._reducerName.toUpperCase()}`);
    }

    buildLookupValue(value, user, onSuccess, onError, fieldsToForceLazy = ''){
        let _this = this;
        return new Promise(function (resolve, reject) {
            remoteApi(_this.findOne(_this.name, value, user, fieldsToForceLazy))
              .then(function (response) {
                resolve(response.data);
                if (onSuccess){
                    onSuccess(response.data);
                }
              })
              .catch(function (error) {
                reject(error);
                if (onError){
                    onError(error)
                }
              });
          });
    }
}

AnterosRemoteResource.GET = GET;
AnterosRemoteResource.POST = POST;
AnterosRemoteResource.DELETE = DELETE;
