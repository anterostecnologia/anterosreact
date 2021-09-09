import {
    AnterosJacksonParser, autoBind
} from '@anterostecnologia/anteros-react-core';
import {
    makeDefaultReduxActions
} from './AnterosReduxHelper';
import remoteApi from './AnterosRemoteApi';
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

    POST(resourceName, entity, user) {
        let result = {
            url: `${this.url}${resourceName}`,
            method: POST,
            data: AnterosJacksonParser.convertObjectToJson(entity)
        };
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }

    DELETE(resourceName, entity, user) {
        let result = {
            url: `${this.url}${resourceName}${entity.id}`,
            method: DELETE
        };
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }

    VALIDATE(resourceName, entity, user) {
        let result = {
            url: `${this.url}${resourceName}validate`,
            method: POST,
            data: AnterosJacksonParser.convertObjectToJson(entity)
        };
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }

    FIND_ONE(resourceName, value, user, fieldsToForceLazy = "") {
        let result = {
            url: `${this.url}${resourceName}${value}?fieldsToForceLazy=${fieldsToForceLazy}`,
            method: GET
        };
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }

    FIND_ALL(resourceName, page, size, sort, user, fieldsToForceLazy = "", status = 'ATIVO') {
        let result = {
            url: `${this.url}${resourceName}findAll?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`,
            method: GET
        };
        this.applySort(sort, result);
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }

    FIND_WITH_FILTER(resourceName, data, page, size, user, fieldsToForceLazy = "", status = "ATIVO") {
        let result = {
            url: `${this.url}${resourceName}findWithFilter?page=${page}&size=${size}&fieldsToForceLazy=${fieldsToForceLazy}`,
            data: data,
            method: POST
        };
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }

    FIND_MULTIPLE_FIELDS(
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
        let result = {
            url: `${this.url}${resourceName}findMultipleFields?filter=${filter}&fields=${fields}&page=${page}&size=${size}&sort=${sort}&fieldsToForceLazy=${fieldsToForceLazy}`,
            method: POST
        };
        result = this.applyOwner(user, result);
        return this.applyCompany(user, result);
    }

    applySort(sort, result) {
        if (sort) {
            result.url = `${result.url}&sort=${sort}`;
        }
    }

    applyCompany(user, result) {
        if (user.company) {
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
        if (user.owner) {
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
}

AnterosRemoteResource.GET = GET;
AnterosRemoteResource.POST = POST;
AnterosRemoteResource.DELETE = DELETE;