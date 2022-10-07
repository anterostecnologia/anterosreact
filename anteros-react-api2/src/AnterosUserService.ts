import axios from "axios";
import { decode } from "universal-base64";
import qs from "qs";
import "regenerator-runtime/runtime";
import { processErrorMessage } from "./AnterosErrorMessageHelper";

export class UserConfig {
  private _url: string;
  private _realm: string;
  private _clientId: string;
  private _clientSecret: string;
  private _tokenTimeoutHandle?: number;
  private _onAuthError?: Function;
  private _onAuthLogout?: Function;
  private _onAuthLogin?: Function;
  private _onAuthRefreshSuccess?: Function;
  private _onAuthRefreshError?: Function;
  private _onTokenExpired?: Function;
  private _owner: any;
  private _localStorage: any;
  private _secretKey: string;

  constructor(
    url: string,
    realm: string,
    clientId: string,
    clientSecret: string,
    owner: any,
    localStorage: any,
    secretKey: string,
    tokenTimeoutHandle?: number,
    onAuthError?: Function,
    onAuthLogout?: Function,
    onAuthLogin?: Function,
    onAuthRefreshSuccess?: Function,
    onAuthRefreshError?: Function,
    onTokenExpired?: Function
  ) {
    this._url = url;
    this._realm = realm;
    this._clientId = clientId;
    this._clientSecret = clientSecret;
    this._owner = owner;
    this._tokenTimeoutHandle = tokenTimeoutHandle;
    this._onAuthError = onAuthError;
    this._onAuthLogout = onAuthLogout;
    this._onAuthLogin = onAuthLogin;
    this._onAuthRefreshSuccess = onAuthRefreshSuccess;
    this._onAuthRefreshError = onAuthRefreshError;
    this._onTokenExpired = onTokenExpired;
    this._localStorage = localStorage;
    this._secretKey = secretKey;
  }

  /**
   * Getter url
   * @return {string}
   */
  public get url(): string {
    return this._url;
  }

  /**
   * Getter realm
   * @return {string}
   */
  public get realm(): string {
    return this._realm;
  }

  /**
   * Getter clientId
   * @return {string}
   */
  public get clientId(): string {
    return this._clientId;
  }

  /**
   * Getter clientSecret
   * @return {string}
   */
  public get clientSecret(): string {
    return this._clientSecret;
  }

  /**
   * Getter tokenTimeoutHandle
   * @return {number}
   */
  public get tokenTimeoutHandle(): number | undefined {
    return this._tokenTimeoutHandle;
  }

  /**
   * Getter onAuthError
   * @return {Function}
   */
  public get onAuthError(): Function | undefined {
    return this._onAuthError;
  }

  /**
   * Getter onAuthLogout
   * @return {Function}
   */
  public get onAuthLogout(): Function | undefined {
    return this._onAuthLogout;
  }

  /**
   * Getter onAuthLogin
   * @return {Function}
   */
  public get onAuthLogin(): Function | undefined {
    return this._onAuthLogin;
  }

  /**
   * Getter onAuthRefreshSuccess
   * @return {Function}
   */
  public get onAuthRefreshSuccess(): Function | undefined {
    return this._onAuthRefreshSuccess;
  }

  /**
   * Getter onAuthRefreshError
   * @return {Function}
   */
  public get onAuthRefreshError(): Function | undefined {
    return this._onAuthRefreshError;
  }

  /**
   * Getter onTokenExpired
   * @return {Function}
   */
  public get onTokenExpired(): Function | undefined {
    return this._onTokenExpired;
  }

  /**
   * Setter url
   * @param {string} value
   */
  public set url(value: string) {
    this._url = value;
  }

  /**
   * Setter realm
   * @param {string} value
   */
  public set realm(value: string) {
    this._realm = value;
  }

  /**
   * Setter clientId
   * @param {string} value
   */
  public set clientId(value: string) {
    this._clientId = value;
  }

  /**
   * Setter clientSecret
   * @param {string} value
   */
  public set clientSecret(value: string) {
    this._clientSecret = value;
  }

  /**
   * Setter tokenTimeoutHandle
   * @param {number} value
   */
  public set tokenTimeoutHandle(value: number | undefined) {
    this._tokenTimeoutHandle = value;
  }

  /**
   * Setter onAuthError
   * @param {Function} value
   */
  public set onAuthError(value: Function | undefined) {
    this._onAuthError = value;
  }

  /**
   * Setter onAuthLogout
   * @param {Function} value
   */
  public set onAuthLogout(value: Function | undefined) {
    this._onAuthLogout = value;
  }

  /**
   * Setter onAuthLogin
   * @param {Function} value
   */
  public set onAuthLogin(value: Function | undefined) {
    this._onAuthLogin = value;
  }

  /**
   * Setter onAuthRefreshSuccess
   * @param {Function} value
   */
  public set onAuthRefreshSuccess(value: Function | undefined) {
    this._onAuthRefreshSuccess = value;
  }

  /**
   * Setter onAuthRefreshError
   * @param {Function} value
   */
  public set onAuthRefreshError(value: Function | undefined) {
    this._onAuthRefreshError = value;
  }

  /**
   * Setter onTokenExpired
   * @param {Function} value
   */
  public set onTokenExpired(value: Function | undefined) {
    this._onTokenExpired = value;
  }

  /**
   * Getter owner
   * @return {string}
   */
  public get owner(): any {
    return this._owner;
  }

  /**
   * Setter owner
   * @param {string} value
   */
  public set owner(value: any) {
    this._owner = value;
  }
  /**
   * Getter localStorage
   * @return {any}
   */
  public get localStorage(): any {
    return this._localStorage;
  }

  /**
   * Setter localStorage
   * @param {any} value
   */
  public set localStorage(value: any) {
    this._localStorage = value;
  }

  /**
   * Getter secretKey
   * @return {string}
   */
  public get secretKey(): string {
    return this._secretKey;
  }

  /**
   * Setter secretKey
   * @param {string} value
   */
  public set secretKey(value: string) {
    this._secretKey = value;
  }
}

export type UserData = {
  id: string;
  userName: string;
  token: string | undefined;
  name: string;
  fullName: string;
  email: string;
  avatar: string | undefined;
  company: any | undefined;
  owner: any | undefined;
  role: string;
  store: any | undefined;
  userSystem: any | undefined;
};

export interface IAnterosUserService {
  login(
    username: string,
    password: string,
    successCallback: Function,
    errorCallback: Function
  );
  logout();
  isLoggedIn(): boolean;
  clearToken();
  getToken(): string | undefined;
  isTokenExpired(minValidity?: number): boolean;
  updateToken(
    minValidity: number | undefined,
    successCallback: Function | undefined,
    errorCallback: Function | undefined
  );
  getUsername(): string;
  getEmail(): string;
  getName(): string;
  getFullName(): string;
  getAvatar(): string | undefined;
  getId(): string;
  getSessionId(): string | undefined;
  hasRealmRole(role: string): boolean;
  getUserData(): UserData;
  getCompany(): any | undefined;
  setCompany(company: any): void;
  getStore(): any | undefined;
  setStore(store: any): void;
  getOwner(): any | undefined;
  setOwner(owner: any): void;
  getUserSystem(): any | undefined;
  setUserSystem(user: any): void;
}

export class AnterosKeycloakUserService implements IAnterosUserService {
  private userConfig: UserConfig;
  private token?: string;
  private tokenParsed?: any;
  private refreshToken?: string;
  private sessionId?: string;
  private realmAccess?: any;
  private resourceAccess?: any;
  private authenticated: boolean = false;
  private timeSkew?: number;
  private company?: any;
  private store?: any;
  private owner?: any;
  private userSystem?: any;

  constructor(config: UserConfig) {
    this.userConfig = config;
    this.owner = config.owner;
  }

  getUserData(): UserData {
    return {
      id: this.getId(),
      avatar: this.getAvatar(),
      email: this.getEmail(),
      fullName: this.getFullName(),
      name: this.getName(),
      userName: this.getUsername(),
      token: this.getToken(),
      company: this.getCompany(),
      owner: this.getOwner(),
      role: this.getRole(),
      store: this.getStore(),
      userSystem: this.getUserSystem(),
    };
  }

  login(
    username: string,
    password: string,
    successCallback: Function | undefined,
    errorCallback: Function | undefined
  ) {
    var data = qs.stringify({
      client_id: this.userConfig.clientId,
      username: username,
      password: password,
      grant_type: "password",
      client_secret: this.userConfig.clientSecret,
    });
    var config = {
      method: "post",
      url: `${this.userConfig.url}/realms/${this.userConfig.realm}/protocol/openid-connect/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };
    var timeLocal = new Date().getTime();
    axios(config)
      .then((response) => {
        console.log("[OAUTH2] Token atualizado.");
        timeLocal = (timeLocal + new Date().getTime()) / 2;
        var tokenResponse = response.data;
        this.setToken(
          tokenResponse["access_token"],
          tokenResponse["refresh_token"],
          tokenResponse["id_token"],
          timeLocal
        );
        successCallback &&
          successCallback({
            id: this.getId(),
            userName: this.getUsername(),
            token: tokenResponse,
            name: this.getName(),
            fullName: this.getFullName(),
            email: this.getEmail(),
            avatar: this.getAvatar(),
            company: this.getCompany(),
            owner: this.getOwner(),
            role: this.getRole(),
            store: this.getStore(),
            userSystem: this.getUserSystem(),
          });
      })
      .catch((error) => {
        this.clearToken();
        errorCallback && errorCallback(processErrorMessage(error));
      });
  }

  logout() {
    this.authenticated = false;
    this.clearToken();
  }

  isLoggedIn(): boolean {
    return this.authenticated;
  }

  getToken(): string | undefined {
    return this.token;
  }

  setToken(
    token: string | undefined,
    refreshToken: string | undefined,
    idToken: string | undefined,
    timeLocal
  ) {
    if (this.userConfig.tokenTimeoutHandle) {
      clearTimeout(this.userConfig.tokenTimeoutHandle);
      this.userConfig.tokenTimeoutHandle = undefined;
    }

    if (refreshToken) {
      this.refreshToken = refreshToken;
    } else {
      this.refreshToken = undefined;
    }

    if (idToken) {
    } else {
    }

    if (token) {
      this.token = token;
      this.tokenParsed = this.decodeToken(token);
      this.sessionId = this.tokenParsed.session_state;
      this.authenticated = true;
      this.realmAccess = this.tokenParsed.realm_access;
      this.resourceAccess = this.tokenParsed.resource_access;

      if (timeLocal) {
        this.timeSkew = Math.floor(timeLocal / 1000) - this.tokenParsed.iat;
      }

      if (this.timeSkew != null) {
        console.log(
          "[OAUTH2] A diferença de tempo estimada entre navegador e servidor é " +
            this.timeSkew +
            "segundos"
        );

        if (this.userConfig.onTokenExpired) {
          var expiresIn =
            (this.tokenParsed["exp"] -
              new Date().getTime() / 1000 +
              this.timeSkew) *
            1000;
          console.log(
            "[OAUTH2] Token expira " + Math.round(expiresIn / 1000) + " s"
          );
          if (expiresIn <= 0) {
            this.userConfig.onTokenExpired();
          } else {
            this.userConfig.tokenTimeoutHandle = setTimeout(
              this.userConfig.onTokenExpired,
              expiresIn
            );
          }
        }
      }
    } else {
      this.token = undefined;
      this.tokenParsed = undefined;
      this.realmAccess = undefined;
      this.resourceAccess = undefined;

      this.authenticated = false;
    }
  }

  getRole() {
    if (this.resourceAccess) {
      if (
        this.resourceAccess[this.userConfig.realm].roles &&
        this.resourceAccess[this.userConfig.realm].roles.length > 0
      ) {
        return this.resourceAccess[this.userConfig.realm].roles[0];
      }
    }
    return "";
  }

  decodeToken(str) {
    str = str.split(".")[1];
    str = str.replace(/-/g, "+");
    str = str.replace(/_/g, "/");
    switch (str.length % 4) {
      case 0:
        break;
      case 2:
        str += "==";
        break;
      case 3:
        str += "=";
        break;
      default:
        throw new Error("Invalid token");
    }

    str = decodeURIComponent(escape(decode(str)));

    str = JSON.parse(str);
    return str;
  }

  updateToken(
    minValidity: number | undefined,
    successCallback: Function,
    errorCallback: Function
  ) {
    minValidity = minValidity || 5;

    var refreshToken = false;
    if (minValidity === -1) {
      refreshToken = true;
      console.log("[OAUTH2] Token refresh: refresh forçado");
    } else if (!this.tokenParsed || this.isTokenExpired(minValidity)) {
      refreshToken = true;
      console.log("[OAUTH2] Token refresh: o token expirou");
    }

    if (!refreshToken) {
      successCallback && successCallback(this.tokenParsed);
    } else {
      var data = qs.stringify({
        client_id: this.userConfig.clientId,
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_secret: this.userConfig.clientSecret,
      });
      var config = {
        method: "post",
        url: `${this.userConfig.url}/realms/${this.userConfig.realm}/protocol/openid-connect/token`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };
      var timeLocal = new Date().getTime();
      axios(config)
        .then((response) => {
          console.log("[OAUTH2] Token atualizado.");
          timeLocal = (timeLocal + new Date().getTime()) / 2;
          var tokenResponse = JSON.parse(response.data);
          this.setToken(
            tokenResponse["access_token"],
            tokenResponse["refresh_token"],
            tokenResponse["id_token"],
            timeLocal
          );
          successCallback &&
            successCallback({
              id: this.getId(),
              userName: this.getUsername(),
              token: tokenResponse,
              name: this.getName(),
              fullName: this.getFullName(),
              email: this.getEmail(),
              avatar: this.getAvatar(),
              company: this.getCompany(),
              owner: this.getOwner(),
              role: this.getRole(),
              store: this.getStore(),
              userSystem: this.getUserSystem(),
            });
        })
        .catch((error) => {
          errorCallback && errorCallback(processErrorMessage(error));
        });
    }
  }

  getStore(): any | undefined {
    return this.store;
  }

  setStore(store): void {
    this.store = store;
  }

  getCompany(): any | undefined {
    return this.company;
  }

  setCompany(company): void {
    this.company = company;
  }

  getUserSystem(): any | undefined {
    return this.userSystem;
  }

  setUserSystem(user: any): void {
    this.userSystem = user;
  }

  getOwner(): any | undefined {
    return this.owner;
  }

  setOwner(owner: any): void {
    this.owner = owner;
  }

  getUsername(): string {
    return this.tokenParsed.preferred_username;
  }

  getEmail(): string {
    return this.tokenParsed.email;
  }

  getAvatar(): string {
    return this.tokenParsed.avatar;
  }

  getName(): string {
    return this.tokenParsed.given_name;
  }

  getId(): string {
    return this.tokenParsed.sid;
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  getFullName(): string {
    return this.tokenParsed.name;
  }

  hasRealmRole(role: string) {
    var access = this.realmAccess;
    return !!access && access.roles.indexOf(role) >= 0;
  }

  hasResourceRole(role, resource) {
    if (!this.resourceAccess) {
      return false;
    }

    var access = this.resourceAccess[resource || this.userConfig.clientId];
    return !!access && access.roles.indexOf(role) >= 0;
  }

  clearToken() {
    this.setToken(undefined, undefined, undefined, 0);
    this.userConfig.onAuthLogout && this.userConfig.onAuthLogout();
  }

  isTokenExpired(minValidity?: number): boolean {
    if (!this.tokenParsed || !this.refreshToken) {
      throw new Error("Não autenticado");
    }

    if (this.timeSkew == null) {
      console.log(
        "Incapaz de determinar se o token expirou à medida que o tempo não está definido"
      );
      return true;
    }

    var expiresIn =
      this.tokenParsed["exp"] -
      Math.ceil(new Date().getTime() / 1000) +
      this.timeSkew;
    if (minValidity) {
      if (isNaN(minValidity)) {
        throw new Error("Inválido minValidity");
      }
      expiresIn -= minValidity;
    }
    return expiresIn < 0;
  }
}
