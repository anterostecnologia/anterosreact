import {AnterosRemoteApi as remoteApi} from '@anterostecnologia/anteros-react-api';

export function createDatasourceApiAdapter() {
  return new DataSourceApiAdapter(remoteApi);
}

class DataSourceApiAdapter {
    constructor(api){
        this.api = api;
    }

    changeApi(api){
        this.api = api;
    }

    save(config){
        return this.api(config);
    }

    delete(config){
        return this.api(config);
    }

    get(config) {
        return this.api(config);
    }
}

const defaultInstance = createDatasourceApiAdapter();

export default defaultInstance;


// post<TRequest, TResponse>(
//     path: string,
//     object: TRequest,
//     config?: RequestConfig
//   ): Promise<TResponse>;
//   patch<TRequest, TResponse>(
//     path: string,
//     object: TRequest
//   ): Promise<TResponse>;
//   put<TRequest, TResponse>(path: string, object: TRequest): Promise<TResponse>;
//   get<TResponse>(path: string): Promise<TResponse>;



