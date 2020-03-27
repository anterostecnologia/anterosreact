import { AnterosJacksonParser } from 'anteros-react-core';

export class AnterosQueryBuilderData {
  static getSaveFilterConfig(filter) {
    let jsonFilter = AnterosJacksonParser.convertObjectToJson(filter);
    return {
      url: `v1/filtro/`,
      method: 'post',
      data: jsonFilter
    };
  }

  static getRemoveFilterConfig(filter) {
    return {
      url: `v1/filtro/${filter.idFilter}`,
      method: 'delete'
    };
  }

  static getFilters(form, component) {
    return {
      url: `v1/filtro/findFilterByForm?form=${form}&component=${component}&fieldsToForceLazy=`,
      method: 'get'
    };
  }

  static configureDatasource(datasource) {
    datasource.setAjaxPostConfigHandler(filter => {
      return AnterosQueryBuilderData.getSaveFilterConfig(filter);
    });
    datasource.setValidatePostResponse(response => {
      return response.data !== undefined;
    });
    datasource.setAjaxDeleteConfigHandler(filter => {
      return AnterosQueryBuilderData.getRemoveFilterConfig(filter);
    });
    datasource.setValidateDeleteResponse(response => {
      return response.data !== undefined;
    });
  }
}
