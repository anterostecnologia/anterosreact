import {AnterosJacksonParser} from "anteros-react-core";

export class AnterosQueryBuilderData {

    constructor() {
    }


    static getSaveFilterConfig(filter) {
        let jsonFilter = AnterosJacksonParser.convertObjectToJson(filter);
        return {
            url: `queryFilter/`,
            method: 'post',
            withCredentials: true,
            data: jsonFilter
        }
    }

    static getRemoveFilterConfig(filter) {
        return {
            url: `queryFilter/${filter.idFilter}`,
            withCredentials: true,
            method: 'delete',
        }
    }

    static getFilters(form, component) {
        return {
            url: `queryFilter/findFilterByForm?form=${form}&component=${component}`,
            withCredentials: true,
            method: 'get'
        }
    }
}
