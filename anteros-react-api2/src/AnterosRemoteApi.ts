import axios, { AxiosInstance } from "axios";
import "regenerator-runtime/runtime";
import { processErrorMessage } from "./AnterosErrorMessageHelper";
import {
  IAnterosUserService,
  SuccessCallback,
  ErrorCallback,
  UserData,
} from "./AnterosUserService";

export type HttpHeaders = {
  [key: string]: string;
};

export type RequestConfig = {
  headers: HttpHeaders;
};

export class ApiConfiguration {
  urlBase?: string;
  credentials?: Object;
}

const handleServiceError = (error) => {
  console.log(error);
};

export interface IAnterosApiClient {
  getConfiguration(): ApiConfiguration;
  getClient(): any;
  applyAuthorization(config): any;
  post<TRequest, TResponse>(
    url: string,
    data: TRequest,
    config?: RequestConfig
  ): Promise<TResponse>;
  patch<TRequest, TResponse>(url: string, data: TRequest): Promise<TResponse>;
  put<TRequest, TResponse>(
    url: string,
    data: TRequest,
    config?: RequestConfig
  ): Promise<TResponse>;
  get<TResponse>(url: string): Promise<TResponse>;
  delete<TRequest, TResponse>(url: string, data: TRequest): Promise<TResponse>;
}

export class DatasourceApiAdapter {
  private _apiClient: any;
  constructor(apiClient: any) {
    this._apiClient = apiClient;
  }

  save(config: any) {
    return this._apiClient(config);
  }

  delete(config: any) {
    return this._apiClient(config);
  }

  get(config: any) {
    return this._apiClient(config);
  }
}

export class AnterosAxiosApiClient
  implements IAnterosApiClient, SuccessCallback, ErrorCallback
{
  private client: AxiosInstance;
  private apiConfiguration: ApiConfiguration;
  private userService: IAnterosUserService;

  constructor(
    apiConfiguration: ApiConfiguration,
    userService: IAnterosUserService
  ) {
    this.apiConfiguration = apiConfiguration;
    this.userService = userService;
    this.client = this.createAxiosClient(apiConfiguration);
  }

  getClient(): AxiosInstance {
    return this.client;
  }

  getConfiguration(): ApiConfiguration {
    return this.apiConfiguration;
  }

  onSuccess(_userData: UserData) {
    //
  }

  onError(error: string) {
    console.log(error);
  }

  protected createAxiosClient(
    apiConfiguration: ApiConfiguration
  ): AxiosInstance {
    let result = axios.create({
      baseURL: apiConfiguration.urlBase,
      responseType: "json" as const,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 180 * 1000,
    });

    result.interceptors.request.use(
      (config) => {
        return this.configureRequest(config);
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    result.interceptors.response.use(
      (response) => {
        return response;
      },
      async (err) => {
        const originalConfig = err.config;
        if (err.response) {
          if (err.response.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;
            try {
              await this.userService.updateToken(5, this, this);
              return this.client(this.configureRequest(originalConfig));
            } catch (_error: any) {
              if (_error.response && _error.response.data) {
                return Promise.reject(_error.response.data);
              }
              return Promise.reject(_error);
            }
          }
          if (err.response.status === 403 && err.response.data) {
            return Promise.reject(err.response.data);
          }
        }

        return Promise.reject(err);
      }
    );

    return result;
  }

  private getOptions = () => {
    return {
      invalidTokenStatuses: [401],
      tokenHeaderName: "authorization",
      buildTokenHeader: function (_token) {
        return `bearer ${_token}`;
      },
    };
  };

  applyAuthorization(config: any) {
    return this.configureRequest(config);
  }

  private configureRequest = (config) => {
    const _token = this.userService.getToken();
    if (_token) {
      config.baseURL = this.apiConfiguration.urlBase;
      config.headers["Authorization"] = this.getAuthorizationHeader(_token); // para Spring Boot back-end
      config.headers["Access-Control-Allow-Origin"] = "*";
      config.headers["Access-Control-Allow-Methods"] =
        "POST, GET, OPTIONS, DELETE";
      config.headers["Access-Control-Max-Age"] = "3600";
      config.headers["Access-Control-Allow-Headers"] =
        "Accept, Accept-CH, Accept-Charset, Accept-Datetime, Accept-Encoding, Accept-Ext, Accept-Features, Accept-Language, Accept-Params, Accept-Ranges, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Expose-Headers, Access-Control-Max-Age, Access-Control-Request-Headers, Access-Control-Request-Method, Age, Allow, Alternates, Authentication-Info, Authorization, C-Ext, C-Man, C-Opt, C-PEP, C-PEP-Info, CONNECT, Cache-Control, Compliance, Connection, Content-Base, Content-Disposition, Content-Encoding, Content-ID, Content-Language, Content-Length, Content-Location, Content-MD5, Content-Range, Content-Script-Type, Content-Security-Policy, Content-Style-Type, Content-Transfer-Encoding, Content-Type, Content-Version, Cookie, Cost, DAV, DELETE, DNT, DPR, Date, Default-Style, Delta-Base, Depth, Derived-From, Destination, Differential-ID, Digest, ETag, Expect, Expires, Ext, From, GET, GetProfile, HEAD, HTTP-date, Host, IM, If, If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since, Keep-Alive, Label, Last-Event-ID, Last-Modified, Link, Location, Lock-Token, MIME-Version, Man, Max-Forwards, Media-Range, Message-ID, Meter, Negotiate, Non-Compliance, OPTION, OPTIONS, OWS, Opt, Optional, Ordering-Type, Origin, Overwrite, P3P, PEP, PICS-Label, POST, PUT, Pep-Info, Permanent, Position, Pragma, ProfileObject, Protocol, Protocol-Query, Protocol-Request, Proxy-Authenticate, Proxy-Authentication-Info, Proxy-Authorization, Proxy-Features, Proxy-Instruction, Public, RWS, Range, Referer, Refresh, Resolution-Hint, Resolver-Location, Retry-After, Safe, Sec-Websocket-Extensions, Sec-Websocket-Key, Sec-Websocket-Origin, Sec-Websocket-Protocol, Sec-Websocket-Version, Security-Scheme, Server, Set-Cookie, Set-Cookie2, SetProfile, SoapAction, Status, Status-URI, Strict-Transport-Security, SubOK, Subst, Surrogate-Capability, Surrogate-Control, TCN, TE, TRACE, Timeout, Title, Trailer, Transfer-Encoding, UA-Color, UA-Media, UA-Pixels, UA-Resolution, UA-Windowpixels, URI, Upgrade, User-Agent, Variant-Vary, Vary, Version, Via, Viewport-Width, WWW-Authenticate, Want-Digest, Warning, Width, X-Content-Duration, X-Content-Security-Policy, X-Content-Type-Options, X-CustomHeader, X-DNSPrefetch-Control, X-Forwarded-For, X-Forwarded-Port, X-Forwarded-Proto, X-Frame-Options, X-Modified, X-OTHER, X-PING, X-PINGOTHER, X-Powered-By, X-Requested-With";
    }
    return config;
  };

  private getAuthorizationHeader = (accessToken: string) =>
    this.getOptions().buildTokenHeader(accessToken);

  async post<TRequest, TResponse>(
    path: string,
    payload: TRequest,
    config?: RequestConfig
  ): Promise<TResponse> {
    try {
      const response = config
        ? await this.client.post<TResponse>(path, payload, config)
        : await this.client.post<TResponse>(path, payload);
      return response.data;
    } catch (error) {
      return new Promise(() => {
        throw new Error(processErrorMessage(error));
      });
    }
  }

  async patch<TRequest, TResponse>(
    path: string,
    payload: TRequest
  ): Promise<TResponse> {
    try {
      const response = await this.client.patch<TResponse>(path, payload);
      return response.data;
    } catch (error) {
      return new Promise(() => {
        throw new Error(processErrorMessage(error));
      });
    }
  }

  async put<TRequest, TResponse>(
    path: string,
    payload: TRequest
  ): Promise<TResponse> {
    try {
      const response = await this.client.put<TResponse>(path, payload);
      return response.data;
    } catch (error) {
      return new Promise(() => {
        throw new Error(processErrorMessage(error));
      });
    }
  }

  async delete<TRequest, TResponse>(
    path: string,
    payload: TRequest
  ): Promise<TResponse> {
    try {
      const response = await this.client.delete<TResponse>(path, payload);
      return response.data;
    } catch (error) {
      handleServiceError(error);
    }
    return {} as TResponse;
  }

  async get<TResponse>(path: string): Promise<TResponse> {
    try {
      const response = await this.client.get<TResponse>(path);
      return response.data;
    } catch (error) {
      handleServiceError(error);
      return new Promise(() => {
        throw new Error(processErrorMessage(error));
      });
    }
  }

  setCredentials(credentials): IAnterosApiClient {
    this.apiConfiguration.credentials = credentials;
    return this;
  }

  setBaseURL(urlBase: string): IAnterosApiClient {
    this.apiConfiguration.urlBase = urlBase;
    axios.defaults.baseURL = urlBase;
    return this;
  }
}
