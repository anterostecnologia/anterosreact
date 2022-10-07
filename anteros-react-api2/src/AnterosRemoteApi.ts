import axios, { AxiosInstance } from "axios";
import "regenerator-runtime/runtime";
import { processErrorMessage } from "./AnterosErrorMessageHelper";
import { IAnterosUserService, UserData } from "./AnterosUserService";
import { encode, decode } from "universal-base64";
import qs from "qs";
import { AnterosJacksonParser } from "@anterostecnologia/anteros-react-core";
var CryptoJS = require("crypto-js");

export type HttpHeaders = {
  [key: string]: string;
};

export type RequestConfig = {
  headers: HttpHeaders;
};

export class ApiConfiguration {
  private _urlBase: string;
  private _secretKey: string;
  private _urlSaaS?: string;
  private _credentials?: Object;
  private _localStorage?: any;

  constructor(
    urlBase: string,
    secretKey: string,
    localStorage: any,
    urlSaaS?: string
  ) {
    this._urlBase = urlBase;
    this._secretKey = secretKey;
    this._urlSaaS = urlSaaS;
    this._localStorage = localStorage;
  }

  /**
   * Getter urlBase
   * @return {string}
   */
  public get urlBase(): string {
    return this._urlBase;
  }

  /**
   * Getter secretKey
   * @return {string}
   */
  public get secretKey(): string {
    return this._secretKey;
  }

  /**
   * Setter urlBase
   * @param {string} value
   */
  public set urlBase(value: string) {
    this._urlBase = value;
  }

  /**
   * Setter secretKey
   * @param {string} value
   */
  public set secretKey(value: string) {
    this._secretKey = value;
  }

  /**
   * Getter urlSaaS
   * @return {string}
   */
  public get urlSaaS(): string | undefined {
    return this._urlSaaS;
  }

  /**
   * Getter credentials
   * @return {Object}
   */
  public get credentials(): Object | undefined {
    return this._credentials;
  }

  /**
   * Getter localStorage
   * @return {any}
   */
  public get localStorage(): any {
    return this._localStorage;
  }

  /**
   * Setter urlSaaS
   * @param {string} value
   */
  public set urlSaaS(value: string | undefined) {
    this._urlSaaS = value;
  }

  /**
   * Setter credentials
   * @param {Object} value
   */
  public set credentials(value: Object | undefined) {
    this._credentials = value;
  }

  /**
   * Setter localStorage
   * @param {any} value
   */
  public set localStorage(value: any) {
    this._localStorage = value;
  }
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
  patch<TRequest, TResponse>(
    url: string,
    data: TRequest,
    config?: RequestConfig
  ): Promise<TResponse>;
  put<TRequest, TResponse>(
    url: string,
    data: TRequest,
    config?: RequestConfig
  ): Promise<TResponse>;
  get<TResponse>(url: string, config?: RequestConfig): Promise<TResponse>;
  delete<TRequest, TResponse>(
    url: string,
    data: TRequest,
    config?: RequestConfig
  ): Promise<TResponse>;
  getSavedUserInformation(credentials);
  getSavedEndpointInformation(credentials);
  getUserInformation(credentials, ownerUrl, onError, onSuccess);
  clear(credentials);
  updateEndpointInformation(credentials, endpoints);
  updateOwnerInfo(credentials, owner);
  validateOwner(credentials, onError, onSuccess);
  getQueryOwners(owners, onError, onSuccess);
  getQueryOwnersByUser(user, onError, onSuccess);
  getOwnerInfo(credentials, profile, ownerUrl, onError, onSuccess, tryCount);
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

export class AnterosAxiosApiClient implements IAnterosApiClient {
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
              await this.userService.updateToken(
                5,
                (userData: UserData) => {
                  this.onSuccess(userData);
                },
                (error) => {
                  this.onError(error);
                }
              );
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
    payload: TRequest,
    config?: RequestConfig
  ): Promise<TResponse> {
    try {
      const response = await this.client.patch<TResponse>(
        path,
        payload,
        config
      );
      return response.data;
    } catch (error) {
      return new Promise(() => {
        throw new Error(processErrorMessage(error));
      });
    }
  }

  async put<TRequest, TResponse>(
    path: string,
    payload: TRequest,
    config?: RequestConfig
  ): Promise<TResponse> {
    try {
      const response = await this.client.put<TResponse>(path, payload, config);
      return response.data;
    } catch (error) {
      return new Promise(() => {
        throw new Error(processErrorMessage(error));
      });
    }
  }

  async delete<TRequest, TResponse>(
    path: string,
    payload: TRequest,
    config?: RequestConfig
  ): Promise<TResponse> {
    try {
      let _config = { ...config, data: payload };
      const response = await this.client.delete<TResponse>(path, _config);
      return response.data;
    } catch (error) {
      handleServiceError(error);
    }
    return {} as TResponse;
  }

  async get<TResponse>(path: string, config?: any): Promise<TResponse> {
    try {
      const response = await this.client.get<TResponse>(path, config);
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

  getSavedUserInformation(credentials) {
    let userInfo = {};
    const KEY_USER_INFO =
      (credentials.owner ? credentials.owner + "_" : "") +
      credentials.username +
      "_userInfo";
    userInfo = this.apiConfiguration.localStorage.getItem(KEY_USER_INFO);
    if (userInfo) {
      userInfo = this.decryptionWithCryptoJS(userInfo);
      userInfo = AnterosJacksonParser.convertJsonToObject(qs.parse(userInfo));
      return userInfo;
    }
  }

  getSavedEndpointInformation(credentials) {
    let userInfo = {};
    const KEY_ENDPOINT_INFO =
      (credentials.owner ? credentials.owner + "_" : "") +
      credentials.username +
      "_endpointInfo";
    userInfo = this.apiConfiguration.localStorage.getItem(KEY_ENDPOINT_INFO);
    if (userInfo) {
      userInfo = this.decryptionWithCryptoJS(userInfo);
      userInfo = AnterosJacksonParser.convertJsonToObject(qs.parse(userInfo));
      return userInfo;
    }
  }

  getUserInformation(credentials, ownerUrl, onError, onSuccess) {
    return this._getUserInformation(credentials, ownerUrl, onError, onSuccess);
  }

  clear(credentials) {
    const KEY_USER_INFO =
      (credentials.owner ? credentials.owner + "_" : "") +
      credentials.username +
      "_userInfo";
    const KEY_ENDPOINT_INFO =
      (credentials.owner ? credentials.owner + "_" : "") +
      credentials.username +
      "_endpointInfo";
    const KEY_OWNER_INFO =
      (credentials.owner ? credentials.owner + "_" : "") +
      credentials.username +
      "_ownerInfo";
    this.apiConfiguration.localStorage.removeItem(KEY_USER_INFO);
    this.apiConfiguration.localStorage.removeItem(KEY_ENDPOINT_INFO);
    this.apiConfiguration.localStorage.removeItem(KEY_OWNER_INFO);
  }

  updateEndpointInformation(credentials, endpoints) {
    const KEY_ENDPOINT_INFO =
      (credentials.owner ? credentials.owner + "_" : "") +
      credentials.username +
      "_endpointInfo";
    const _endpoints = this.encryptWithCryptoJS(qs.stringify(endpoints));
    this.apiConfiguration.localStorage.setItem(KEY_ENDPOINT_INFO, _endpoints);
  }

  updateOwnerInfo(credentials, owner) {
    const KEY_OWNER_INFO =
      (credentials.owner ? credentials.owner + "_" : "") +
      credentials.username +
      "_ownerInfo";
    const _owner = this.encryptWithCryptoJS(qs.stringify(owner));
    this.apiConfiguration.localStorage.setItem(KEY_OWNER_INFO, _owner);
  }

  _getUserInformation(credentials, ownerUrl, onError, onSuccess, tryCount = 1) {
    return new Promise((resolve, reject) => {
      return axios({
        url: `${ownerUrl.urlAPI + "/v1"}/user/getUserByLogin`,
        method: "post",
        headers: {
          Authorization: `Bearer ${this.userService.getToken()}`,
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
          "Access-Control-Max-Age": "3600",
          "X-Tenant-ID": `${credentials.owner ? credentials.owner : ""}`,
          "Access-Control-Allow-Headers":
            "Accept, Accept-CH, Accept-Charset, Accept-Datetime, Accept-Encoding, Accept-Ext, Accept-Features, Accept-Language, Accept-Params, Accept-Ranges, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Expose-Headers, Access-Control-Max-Age, Access-Control-Request-Headers, Access-Control-Request-Method, Age, Allow, Alternates, Authentication-Info, Authorization, C-Ext, C-Man, C-Opt, C-PEP, C-PEP-Info, CONNECT, Cache-Control, Compliance, Connection, Content-Base, Content-Disposition, Content-Encoding, Content-ID, Content-Language, Content-Length, Content-Location, Content-MD5, Content-Range, Content-Script-Type, Content-Security-Policy, Content-Style-Type, Content-Transfer-Encoding, Content-Type, Content-Version, Cookie, Cost, DAV, DELETE, DNT, DPR, Date, Default-Style, Delta-Base, Depth, Derived-From, Destination, Differential-ID, Digest, ETag, Expect, Expires, Ext, From, GET, GetProfile, HEAD, HTTP-date, Host, IM, If, If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since, Keep-Alive, Label, Last-Event-ID, Last-Modified, Link, Location, Lock-Token, MIME-Version, Man, Max-Forwards, Media-Range, Message-ID, Meter, Negotiate, Non-Compliance, OPTION, OPTIONS, OWS, Opt, Optional, Ordering-Type, Origin, Overwrite, P3P, PEP, PICS-Label, POST, PUT, Pep-Info, Permanent, Position, Pragma, ProfileObject, Protocol, Protocol-Query, Protocol-Request, Proxy-Authenticate, Proxy-Authentication-Info, Proxy-Authorization, Proxy-Features, Proxy-Instruction, Public, RWS, Range, Referer, Refresh, Resolution-Hint, Resolver-Location, Retry-After, Safe, Sec-Websocket-Extensions, Sec-Websocket-Key, Sec-Websocket-Origin, Sec-Websocket-Protocol, Sec-Websocket-Version, Security-Scheme, Server, Set-Cookie, Set-Cookie2, SetProfile, SoapAction, Status, Status-URI, Strict-Transport-Security, SubOK, Subst, Surrogate-Capability, Surrogate-Control, TCN, TE, TRACE, Timeout, Title, Trailer, Transfer-Encoding, UA-Color, UA-Media, UA-Pixels, UA-Resolution, UA-Windowpixels, URI, Upgrade, User-Agent, Variant-Vary, Vary, Version, Via, Viewport-Width, WWW-Authenticate, Want-Digest, Warning, Width, X-Content-Duration, X-Content-Security-Policy, X-Content-Type-Options, X-CustomHeader, X-DNSPrefetch-Control, X-Forwarded-For, X-Forwarded-Port, X-Forwarded-Proto, X-Frame-Options, X-Modified, X-OTHER, X-PING, X-PINGOTHER, X-Powered-By, X-Requested-With",
        },
        data: credentials.username,
      })
        .then((response) => {
          if (response.data === "" || response.data === undefined) {
            onError("Usuário/senha não encontrados!");
          } else {
            let data = AnterosJacksonParser.convertJsonToObject(response.data);
            onSuccess(data);
          }
        })
        .catch((error) => {
          onError("Usuário/senha não encontrados!");
        });
    });
  }

  validateOwner(credentials, onError, onSuccess) {
    let _this = this;
    return new Promise((resolve, reject) => {
      return axios({
        url: `${_this.apiConfiguration.urlSaaS}/validation/queryTenant/${credentials.owner}`,
        method: "get",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      })
        .then((response) => {
          if (response.data === "" || response.data === undefined) {
            onError(processErrorMessage(response));
          } else {
            _this.updateEndpointInformation(credentials, response.data);
            let data = AnterosJacksonParser.convertJsonToObject(response.data);
            onSuccess(data);
          }
        })
        .catch((error) => {
          onError(processErrorMessage(error));
        });
    });
  }

  getQueryOwners(owners, onError, onSuccess) {
    return new Promise((resolve, reject) => {
      return axios({
        url: `${this.apiConfiguration.urlSaaS}/validation/queryTenants/${owners}`,
        method: "get",
      })
        .then(function (response) {
          let list = AnterosJacksonParser.convertJsonToObject(response.data);
          onSuccess(list);
        })
        .catch(function (error) {
          onError(processErrorMessage(error));
        });
    });
  }

  getQueryOwnersByUser(user, onError, onSuccess) {
    return new Promise((resolve, reject) => {
      return axios({
        url: `${this.apiConfiguration.urlSaaS}/validation/queryTenantsByUserWeb`,
        method: "post",
        data: encode(user),
      })
        .then(function (response) {
          let list = AnterosJacksonParser.convertJsonToObject(response.data);
          onSuccess(list);
        })
        .catch(function (error) {
          onError(processErrorMessage(error));
        });
    });
  }

  getOwnerInfo(
    credentials,
    profile,
    ownerUrl,
    onError,
    onSuccess,
    tryCount = 1
  ) {
    let ownerInfo = {};
    const KEY_ONWER_INFO = `${
      (credentials.owner ? credentials.owner + "_" : "") + credentials.username
    }_ownerInfo`;
    ownerInfo = this.apiConfiguration.localStorage.getItem(KEY_ONWER_INFO);
    if (ownerInfo && ownerInfo !== "null") {
      ownerInfo = this.decryptionWithCryptoJS(ownerInfo);
      ownerInfo = AnterosJacksonParser.convertJsonToObject(qs.parse(ownerInfo));
      return new Promise((resolve, reject) => {
        onSuccess(ownerInfo);
        return;
      });
    } else {
      let _this = this;
      return new Promise((resolve, reject) => {
        return axios
          .get(
            `${ownerUrl.urlAPI}/v1/empresa/buscarProprietario/${credentials.owner}`,
            {
              headers: {
                Authorization: `Bearer ${this.userService.getToken()}`,
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
                "Access-Control-Max-Age": "3600",
                "Access-Control-Allow-Headers":
                  "Accept, Accept-CH, Accept-Charset, Accept-Datetime, Accept-Encoding, Accept-Ext, Accept-Features, Accept-Language, Accept-Params, Accept-Ranges, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Expose-Headers, Access-Control-Max-Age, Access-Control-Request-Headers, Access-Control-Request-Method, Age, Allow, Alternates, Authentication-Info, Authorization, C-Ext, C-Man, C-Opt, C-PEP, C-PEP-Info, CONNECT, Cache-Control, Compliance, Connection, Content-Base, Content-Disposition, Content-Encoding, Content-ID, Content-Language, Content-Length, Content-Location, Content-MD5, Content-Range, Content-Script-Type, Content-Security-Policy, Content-Style-Type, Content-Transfer-Encoding, Content-Type, Content-Version, Cookie, Cost, DAV, DELETE, DNT, DPR, Date, Default-Style, Delta-Base, Depth, Derived-From, Destination, Differential-ID, Digest, ETag, Expect, Expires, Ext, From, GET, GetProfile, HEAD, HTTP-date, Host, IM, If, If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since, Keep-Alive, Label, Last-Event-ID, Last-Modified, Link, Location, Lock-Token, MIME-Version, Man, Max-Forwards, Media-Range, Message-ID, Meter, Negotiate, Non-Compliance, OPTION, OPTIONS, OWS, Opt, Optional, Ordering-Type, Origin, Overwrite, P3P, PEP, PICS-Label, POST, PUT, Pep-Info, Permanent, Position, Pragma, ProfileObject, Protocol, Protocol-Query, Protocol-Request, Proxy-Authenticate, Proxy-Authentication-Info, Proxy-Authorization, Proxy-Features, Proxy-Instruction, Public, RWS, Range, Referer, Refresh, Resolution-Hint, Resolver-Location, Retry-After, Safe, Sec-Websocket-Extensions, Sec-Websocket-Key, Sec-Websocket-Origin, Sec-Websocket-Protocol, Sec-Websocket-Version, Security-Scheme, Server, Set-Cookie, Set-Cookie2, SetProfile, SoapAction, Status, Status-URI, Strict-Transport-Security, SubOK, Subst, Surrogate-Capability, Surrogate-Control, TCN, TE, TRACE, Timeout, Title, Trailer, Transfer-Encoding, UA-Color, UA-Media, UA-Pixels, UA-Resolution, UA-Windowpixels, URI, Upgrade, User-Agent, Variant-Vary, Vary, Version, Via, Viewport-Width, WWW-Authenticate, Want-Digest, Warning, Width, X-Content-Duration, X-Content-Security-Policy, X-Content-Type-Options, X-CustomHeader, X-DNSPrefetch-Control, X-Forwarded-For, X-Forwarded-Port, X-Forwarded-Proto, X-Frame-Options, X-Modified, X-OTHER, X-PING, X-PINGOTHER, X-Powered-By, X-Requested-With",
              },
            }
          )
          .then((response) => {
            if (response.data === "" || response.data === undefined) {
              onError("Proprietário do sistema não encontrado!");
            } else {
              _this.updateOwnerInfo(credentials, response.data);
              let data = AnterosJacksonParser.convertJsonToObject(
                response.data
              );
              onSuccess(data);
            }
          })
          .catch((error) => {
            onError("Proprietário do sistema não encontrado!");
          });
      });
    }
  }

  getSecretKey() {
    return decode(this.apiConfiguration.secretKey);
  }

  encryptWithCryptoJS(plainText) {
    let sk = this.getSecretKey();
    const key = CryptoJS.enc.Utf8.parse(sk);
    const iv1 = CryptoJS.enc.Utf8.parse(sk);
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      keySize: 16,
      iv: iv1,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted + "";
  }

  decryptionWithCryptoJS(cipher) {
    let sk = this.getSecretKey();
    const key = CryptoJS.enc.Utf8.parse(sk);
    const iv1 = CryptoJS.enc.Utf8.parse(sk);
    const plainText = CryptoJS.AES.decrypt(cipher, key, {
      keySize: 16,
      iv: iv1,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return plainText.toString(CryptoJS.enc.Utf8);
  }
}
