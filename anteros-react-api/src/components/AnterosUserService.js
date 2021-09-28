import {
  AnterosJacksonParser,
} from './AnterosJacksonParser';
import {
  processErrorMessage
} from './AnterosErrorMessageHelper';
import {autoBind} from './AnterosAutoBind';
import {
  authService
} from './AnterosAuthenticationService';
import {
  preferencesService
} from './AnterosPreferencesService';
import { tokenService } from './AnterosTokenService';
import axios from 'axios';
import { decode, encode } from "universal-base64";
import 'regenerator-runtime/runtime';
var CryptoJS = require("crypto-js");


export class AnterosUserService {
  constructor() {
    this.config = {};
    autoBind(this);
    preferencesService.init();
  }

  setConfiguration(config) {
    this.config = config;
  }

  getSavedUserInformation(credentials) {
    let userInfo = {};
    const KEY_USER_INFO = (credentials.owner ? credentials.owner + "_" : "") + credentials.username + "_userInfo";
    userInfo = localStorage.getItem(KEY_USER_INFO);
    if (userInfo) {
      userInfo = CryptoJS.AES.decrypt(decode(userInfo), decode(this.config.secretKey));
      userInfo = userInfo.toString(CryptoJS.enc.Utf8);
      userInfo = AnterosJacksonParser.convertJsonToObject(JSON.parse(userInfo));
      return userInfo;
    }
  }

  getSavedEndpointInformation(credentials) {
    let userInfo = {};
    const KEY_ENDPOINT_INFO = (credentials.owner ? credentials.owner + "_" : "") + credentials.username + "_endpointInfo";
    userInfo = localStorage.getItem(KEY_ENDPOINT_INFO);
    if (userInfo) {
      userInfo = CryptoJS.AES.decrypt(decode(userInfo), decode(this.config.secretKey));
      userInfo = userInfo.toString(CryptoJS.enc.Utf8);
      userInfo = AnterosJacksonParser.convertJsonToObject(JSON.parse(userInfo));
      return userInfo;
    }
  }

  getUserInformation(credentials, token, ownerUrl, onError, onSuccess) {
    let userInfo = {};
    const KEY_USER_INFO = (credentials.owner ? credentials.owner + "_" : "") + credentials.username + "_userInfo";
    userInfo = localStorage.getItem(KEY_USER_INFO);
    if (userInfo) {
      userInfo = CryptoJS.AES.decrypt(decode(userInfo), decode(this.config.secretKey));
      userInfo = userInfo.toString(CryptoJS.enc.Utf8);
      userInfo = AnterosJacksonParser.convertJsonToObject(JSON.parse(userInfo));
      return new Promise((resolve, reject) => {
        onSuccess(userInfo);
        return;
      });
    } else {
      return this._getUserInformation(credentials, token, ownerUrl, onError, onSuccess);
    }
  }

  clear(credentials) {
    const KEY_USER_INFO = (credentials.owner ? credentials.owner + "_" : "") + credentials.username + "_userInfo";
    const KEY_USER_SOCIAL = (credentials.owner ? credentials.owner + "_" : "") + credentials.username + "_userSocialInfo";
    const KEY_ENDPOINT_INFO = (credentials.owner ? credentials.owner + "_" : "") + credentials.username + "_endpointInfo";
    const KEY_OWNER_INFO = (credentials.owner ? credentials.owner + "_" : "") + credentials.username + "_ownerInfo";
    localStorage.removeItem(KEY_USER_INFO);
    localStorage.removeItem(KEY_USER_SOCIAL);
    localStorage.removeItem(KEY_ENDPOINT_INFO);
    localStorage.removeItem(KEY_OWNER_INFO);

  }

  updateEndpointInformation(credentials, endpoints) {
    const KEY_ENDPOINT_INFO = (credentials.owner ? credentials.owner + "_" : "") + credentials.username + "_endpointInfo";
    let _endpoints = encode(CryptoJS.AES.encrypt(JSON.stringify(endpoints), decode(this.config.secretKey)));
    localStorage.setItem(KEY_ENDPOINT_INFO, _endpoints);
  }

  updateUserInformation(credentials, user) {
    const KEY_USER_INFO = (credentials.owner ? credentials.owner + "_" : "") + credentials.username + "_userInfo";
    let _user = encode(CryptoJS.AES.encrypt(JSON.stringify(user), decode(this.config.secretKey)));
    localStorage.setItem(KEY_USER_INFO, _user);
  }

  updateUserSocialInformation(credentials, user) {
    const KEY_USER_SOCIAL = (credentials.owner ? credentials.owner + "_" : "") + credentials.username + "_userSocialInfo";
    let _user = encode(CryptoJS.AES.encrypt(JSON.stringify(user), decode(this.config.secretKey)));
    localStorage.setItem(KEY_USER_SOCIAL, _user);
  }

  updateOwnerInfo(credentials, owner) {
    const KEY_OWNER_INFO = (credentials.owner ? credentials.owner + "_" : "") + credentials.username + "_ownerInfo";
    let _owner = encode(CryptoJS.AES.encrypt(JSON.stringify(owner), decode(this.config.secretKey)));
    localStorage.setItem(KEY_OWNER_INFO, _owner);
  }

  _getUserInformation(credentials, token, ownerUrl, onError, onSuccess) {
    let url_user = this.config.url_user_with_owner;
    if (ownerUrl) {
      url_user = ownerUrl.urlAPI + '/v1';
    }
    let _this = this;
    return new Promise((resolve, reject) => {
      return axios({
          url: `${url_user}${this.config.getUser}`,
          method: 'post',
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
            'Access-Control-Max-Age': '3600',
            'X-Tenant-ID': `${credentials.owner?credentials.owner:''}`,
            'Access-Control-Allow-Headers': 'Accept, Accept-CH, Accept-Charset, Accept-Datetime, Accept-Encoding, Accept-Ext, Accept-Features, Accept-Language, Accept-Params, Accept-Ranges, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Expose-Headers, Access-Control-Max-Age, Access-Control-Request-Headers, Access-Control-Request-Method, Age, Allow, Alternates, Authentication-Info, Authorization, C-Ext, C-Man, C-Opt, C-PEP, C-PEP-Info, CONNECT, Cache-Control, Compliance, Connection, Content-Base, Content-Disposition, Content-Encoding, Content-ID, Content-Language, Content-Length, Content-Location, Content-MD5, Content-Range, Content-Script-Type, Content-Security-Policy, Content-Style-Type, Content-Transfer-Encoding, Content-Type, Content-Version, Cookie, Cost, DAV, DELETE, DNT, DPR, Date, Default-Style, Delta-Base, Depth, Derived-From, Destination, Differential-ID, Digest, ETag, Expect, Expires, Ext, From, GET, GetProfile, HEAD, HTTP-date, Host, IM, If, If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since, Keep-Alive, Label, Last-Event-ID, Last-Modified, Link, Location, Lock-Token, MIME-Version, Man, Max-Forwards, Media-Range, Message-ID, Meter, Negotiate, Non-Compliance, OPTION, OPTIONS, OWS, Opt, Optional, Ordering-Type, Origin, Overwrite, P3P, PEP, PICS-Label, POST, PUT, Pep-Info, Permanent, Position, Pragma, ProfileObject, Protocol, Protocol-Query, Protocol-Request, Proxy-Authenticate, Proxy-Authentication-Info, Proxy-Authorization, Proxy-Features, Proxy-Instruction, Public, RWS, Range, Referer, Refresh, Resolution-Hint, Resolver-Location, Retry-After, Safe, Sec-Websocket-Extensions, Sec-Websocket-Key, Sec-Websocket-Origin, Sec-Websocket-Protocol, Sec-Websocket-Version, Security-Scheme, Server, Set-Cookie, Set-Cookie2, SetProfile, SoapAction, Status, Status-URI, Strict-Transport-Security, SubOK, Subst, Surrogate-Capability, Surrogate-Control, TCN, TE, TRACE, Timeout, Title, Trailer, Transfer-Encoding, UA-Color, UA-Media, UA-Pixels, UA-Resolution, UA-Windowpixels, URI, Upgrade, User-Agent, Variant-Vary, Vary, Version, Via, Viewport-Width, WWW-Authenticate, Want-Digest, Warning, Width, X-Content-Duration, X-Content-Security-Policy, X-Content-Type-Options, X-CustomHeader, X-DNSPrefetch-Control, X-Forwarded-For, X-Forwarded-Port, X-Forwarded-Proto, X-Frame-Options, X-Modified, X-OTHER, X-PING, X-PINGOTHER, X-Powered-By, X-Requested-With'
          },
          data: credentials.username
        })
        .then(response => {
          if (response.data === '' || response.data === undefined) {
            onError('Usuário/senha não encontrados!');
          } else {
            _this.updateUserInformation(credentials, response.data);
            let data = AnterosJacksonParser.convertJsonToObject(response.data);
            onSuccess(data);
          }
        })
        .catch(error => {
          if (error.response.status === 401){
            tokenService.refreshToken(credentials, onError,(tokenResult)=>{
              _this._getUserInformation(credentials,tokenResult,ownerUrl,onError,onSuccess);
            })
          } else {
            onError('Usuário/senha não encontrados!');
          }
        });
    });
  }

  validateOwner(credentials, onError, onSuccess) {
    let basic = authService.getBasicAuthSaaS();
    let _this = this;
    return new Promise((resolve, reject) => {
      return axios({
          url: `${_this.config.url_baseSaas}/validation/queryTenant/${credentials.owner}`,
          method: 'get',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': basic
          },
        }).then(response => {
          if (response.data === '' || response.data === undefined) {
            onError(processErrorMessage(response));
          } else {
            _this.updateEndpointInformation(credentials, response.data);
            let data = AnterosJacksonParser.convertJsonToObject(response.data);
            onSuccess(data);
          }
        })
        .catch(error => {
          onError(processErrorMessage(error));
        });
    });
  }

  getQueryOwners(owners, onError, onSuccess) {
    return new Promise((resolve, reject) => {
      return axios({
          url: `${versatilSaaSBaseURL}/validation/queryTenants/${owners}`,
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

  getUserSocial(credentials, token, profile, ownerUrl, onError, onSuccess) {
    let userInfo = {};
    const KEY_USER_SOCIAL = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_userSocial`;
    userInfo = localStorage.getItem(KEY_USER_SOCIAL);
    if (userInfo && userInfo !== "null") {
      userInfo = CryptoJS.AES.decrypt(decode(userInfo), decode(this.config.secretKey));
      userInfo = userInfo.toString(CryptoJS.enc.Utf8);
      userInfo = AnterosJacksonParser.convertJsonToObject(JSON.parse(userInfo));
      return new Promise((resolve, reject) => {
        onSuccess(userInfo);
        return;
      });
    } else {
      let url_user = this.config.url_social;
      let _this = this;
      return new Promise((resolve, reject) => {
        return axios({
            url: `${url_user}/${1}`,
            method: 'get',
            headers: {
              Authorization: `Bearer ${token.access_token}`,
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
              'Access-Control-Max-Age': '3600',
              'X-Tenant-ID': `${credentials.owner?credentials.owner:''}`,
              'Access-Control-Allow-Headers': 'Accept, Accept-CH, Accept-Charset, Accept-Datetime, Accept-Encoding, Accept-Ext, Accept-Features, Accept-Language, Accept-Params, Accept-Ranges, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Expose-Headers, Access-Control-Max-Age, Access-Control-Request-Headers, Access-Control-Request-Method, Age, Allow, Alternates, Authentication-Info, Authorization, C-Ext, C-Man, C-Opt, C-PEP, C-PEP-Info, CONNECT, Cache-Control, Compliance, Connection, Content-Base, Content-Disposition, Content-Encoding, Content-ID, Content-Language, Content-Length, Content-Location, Content-MD5, Content-Range, Content-Script-Type, Content-Security-Policy, Content-Style-Type, Content-Transfer-Encoding, Content-Type, Content-Version, Cookie, Cost, DAV, DELETE, DNT, DPR, Date, Default-Style, Delta-Base, Depth, Derived-From, Destination, Differential-ID, Digest, ETag, Expect, Expires, Ext, From, GET, GetProfile, HEAD, HTTP-date, Host, IM, If, If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since, Keep-Alive, Label, Last-Event-ID, Last-Modified, Link, Location, Lock-Token, MIME-Version, Man, Max-Forwards, Media-Range, Message-ID, Meter, Negotiate, Non-Compliance, OPTION, OPTIONS, OWS, Opt, Optional, Ordering-Type, Origin, Overwrite, P3P, PEP, PICS-Label, POST, PUT, Pep-Info, Permanent, Position, Pragma, ProfileObject, Protocol, Protocol-Query, Protocol-Request, Proxy-Authenticate, Proxy-Authentication-Info, Proxy-Authorization, Proxy-Features, Proxy-Instruction, Public, RWS, Range, Referer, Refresh, Resolution-Hint, Resolver-Location, Retry-After, Safe, Sec-Websocket-Extensions, Sec-Websocket-Key, Sec-Websocket-Origin, Sec-Websocket-Protocol, Sec-Websocket-Version, Security-Scheme, Server, Set-Cookie, Set-Cookie2, SetProfile, SoapAction, Status, Status-URI, Strict-Transport-Security, SubOK, Subst, Surrogate-Capability, Surrogate-Control, TCN, TE, TRACE, Timeout, Title, Trailer, Transfer-Encoding, UA-Color, UA-Media, UA-Pixels, UA-Resolution, UA-Windowpixels, URI, Upgrade, User-Agent, Variant-Vary, Vary, Version, Via, Viewport-Width, WWW-Authenticate, Want-Digest, Warning, Width, X-Content-Duration, X-Content-Security-Policy, X-Content-Type-Options, X-CustomHeader, X-DNSPrefetch-Control, X-Forwarded-For, X-Forwarded-Port, X-Forwarded-Proto, X-Frame-Options, X-Modified, X-OTHER, X-PING, X-PINGOTHER, X-Powered-By, X-Requested-With'
            }
          })
          .then(response => {
            if (response.data === '' || response.data === undefined) {
              onError('Usuário social não encontrado!')
            } else {
              _this.updateUserSocialInformation(credentials, response.data);
              let data = AnterosJacksonParser.convertJsonToObject(response.data);
              onSuccess(data);
            }
          })
          .catch(error => {
            if (error.response.status === 401){
              tokenService.refreshToken(credentials, onError,(tokenResult)=>{
                _this.getUserSocial(credentials,tokenResult,ownerUrl,profile,onError,onSuccess);
              })
            } else {
              onError(processErrorMessage(error));
            }
          });
      });
    }
  }

  getOwnerInfo(credentials, token, profile, ownerUrl, onError, onSuccess) {
    let ownerInfo = {};
    const KEY_ONWER_INFO = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_ownerInfo`;
    ownerInfo = localStorage.getItem(KEY_ONWER_INFO);
    if (ownerInfo && ownerInfo !== "null") {
      ownerInfo = CryptoJS.AES.decrypt(decode(ownerInfo), decode(this.config.secretKey));
      ownerInfo = ownerInfo.toString(CryptoJS.enc.Utf8);
      ownerInfo = AnterosJacksonParser.convertJsonToObject(JSON.parse(ownerInfo));
      return new Promise((resolve, reject) => {
        onSuccess(ownerInfo);
        return;
      });
    } else {
      let _this = this;
      return new Promise((resolve, reject) => {
        return axios
          .get(`${ownerUrl.urlAPI}/v1${_this.config.getOwner}${credentials.owner}`, {
            headers: {
              Authorization: `Bearer ${token.access_token}`,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
              'Access-Control-Max-Age': '3600',
              'Access-Control-Allow-Headers': 'Accept, Accept-CH, Accept-Charset, Accept-Datetime, Accept-Encoding, Accept-Ext, Accept-Features, Accept-Language, Accept-Params, Accept-Ranges, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Expose-Headers, Access-Control-Max-Age, Access-Control-Request-Headers, Access-Control-Request-Method, Age, Allow, Alternates, Authentication-Info, Authorization, C-Ext, C-Man, C-Opt, C-PEP, C-PEP-Info, CONNECT, Cache-Control, Compliance, Connection, Content-Base, Content-Disposition, Content-Encoding, Content-ID, Content-Language, Content-Length, Content-Location, Content-MD5, Content-Range, Content-Script-Type, Content-Security-Policy, Content-Style-Type, Content-Transfer-Encoding, Content-Type, Content-Version, Cookie, Cost, DAV, DELETE, DNT, DPR, Date, Default-Style, Delta-Base, Depth, Derived-From, Destination, Differential-ID, Digest, ETag, Expect, Expires, Ext, From, GET, GetProfile, HEAD, HTTP-date, Host, IM, If, If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since, Keep-Alive, Label, Last-Event-ID, Last-Modified, Link, Location, Lock-Token, MIME-Version, Man, Max-Forwards, Media-Range, Message-ID, Meter, Negotiate, Non-Compliance, OPTION, OPTIONS, OWS, Opt, Optional, Ordering-Type, Origin, Overwrite, P3P, PEP, PICS-Label, POST, PUT, Pep-Info, Permanent, Position, Pragma, ProfileObject, Protocol, Protocol-Query, Protocol-Request, Proxy-Authenticate, Proxy-Authentication-Info, Proxy-Authorization, Proxy-Features, Proxy-Instruction, Public, RWS, Range, Referer, Refresh, Resolution-Hint, Resolver-Location, Retry-After, Safe, Sec-Websocket-Extensions, Sec-Websocket-Key, Sec-Websocket-Origin, Sec-Websocket-Protocol, Sec-Websocket-Version, Security-Scheme, Server, Set-Cookie, Set-Cookie2, SetProfile, SoapAction, Status, Status-URI, Strict-Transport-Security, SubOK, Subst, Surrogate-Capability, Surrogate-Control, TCN, TE, TRACE, Timeout, Title, Trailer, Transfer-Encoding, UA-Color, UA-Media, UA-Pixels, UA-Resolution, UA-Windowpixels, URI, Upgrade, User-Agent, Variant-Vary, Vary, Version, Via, Viewport-Width, WWW-Authenticate, Want-Digest, Warning, Width, X-Content-Duration, X-Content-Security-Policy, X-Content-Type-Options, X-CustomHeader, X-DNSPrefetch-Control, X-Forwarded-For, X-Forwarded-Port, X-Forwarded-Proto, X-Frame-Options, X-Modified, X-OTHER, X-PING, X-PINGOTHER, X-Powered-By, X-Requested-With'
            }
          })
          .then(response => {
            if (response.data === '' || response.data === undefined) {
              onError('Proprietário do sistema não encontrado!');
            } else {
              _this.updateOwnerInfo(credentials, response.data);
              let data = AnterosJacksonParser.convertJsonToObject(response.data);
              onSuccess(data);
            }
          })
          .catch(error => {
            onError('Proprietário do sistema não encontrado!');
          });
      });
    }
  }
}

export const userService = new AnterosUserService();