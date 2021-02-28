import { AnterosJacksonParser } from '@anterostecnologia/anteros-react-core';
import {AnterosRemoteDatasource} from '@anterostecnologia/anteros-react-datasource';

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

  static configureDatasource(dataSource, version='v1') {
    dataSource.setAjaxPostConfigHandler(filter => {
      return AnterosQueryBuilderData.getSaveFilterConfig(filter,version);
    });
    dataSource.setValidatePostResponse(response => {
      return response.data !== undefined;
    });
    dataSource.setAjaxDeleteConfigHandler(filter => {
      return AnterosQueryBuilderData.getRemoveFilterConfig(filter,version);
    });
    dataSource.setValidateDeleteResponse(response => {
      return response.data !== undefined;
    });
    dataSource.setAjaxOpenConfigHandler((form,component,vers) => {
      return AnterosQueryBuilderData.getFilters(form,component,vers);
    });
  }

  static createDatasource(form, component, version='v1') {
    let dataSource = new AnterosRemoteDatasource();
    dataSource.setAjaxPostConfigHandler(filter => {
      return AnterosQueryBuilderData.getSaveFilterConfig(filter,version);
    });
    dataSource.setValidatePostResponse(response => {
      return response.data !== undefined;
    });
    dataSource.setAjaxDeleteConfigHandler(filter => {
      return AnterosQueryBuilderData.getRemoveFilterConfig(filter,version);
    });
    dataSource.setValidateDeleteResponse(response => {
      return response.data !== undefined;
    });
    dataSource.setAjaxOpenConfigHandler(() => {
      return AnterosQueryBuilderData.getFilters(form,component,version);
    });
    return dataSource;
  }


}
