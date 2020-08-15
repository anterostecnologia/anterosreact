import { AnterosJacksonParser } from 'anteros-react-core';

export class AnterosQueryBuilderData {
  static getSaveFilterConfig(filter, version='v1') {
    let jsonFilter = AnterosJacksonParser.convertObjectToJson(filter);
    return {
      url: `${version}/filtro/`,
      method: 'post',
      data: jsonFilter
    };
  }

  static getRemoveFilterConfig(filter, version='v1') {
    return {
      url: `${version}/filtro/${filter.idFilter}`,
      method: 'delete'
    };
  }

  static getFilters(form, component, version='v1') {
    return {
      url: `${version}/filtro/findFilterByForm?form=${form}&component=${component}&fieldsToForceLazy=`,
      method: 'get'
    };
  }

  static configureDatasource(datasource, version='v1') {
    datasource.setAjaxPostConfigHandler(filter => {
      return AnterosQueryBuilderData.getSaveFilterConfig(filter,version);
    });
    datasource.setValidatePostResponse(response => {
      return response.data !== undefined;
    });
    datasource.setAjaxDeleteConfigHandler(filter => {
      return AnterosQueryBuilderData.getRemoveFilterConfig(filter,version);
    });
    datasource.setValidateDeleteResponse(response => {
      return response.data !== undefined;
    });
  }
}
