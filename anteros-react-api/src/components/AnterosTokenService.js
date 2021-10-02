import axios from 'axios';
import {
  processErrorMessage
} from './AnterosErrorMessageHelper';
import {
  autoBind
} from './AnterosAutoBind';
import {
  authService
} from './AnterosAuthenticationService';
import {
  userService
} from './AnterosUserService';
import {
  decode,
  encode
} from "universal-base64";
import qs from "qs";
import 'regenerator-runtime/runtime';


var CryptoJS = require("crypto-js");


export class AnterosTokenService {

  constructor() {
    this.config = {};
    autoBind(this);
  }

  setConfiguration(config) {
    this.config = config;
  }

  getAccessToken(credentials) {
    const KEY_TOKEN = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_token`;
    let token = this.config.localStorage.getItem(KEY_TOKEN);
    if (!token) {
      return;
    }
    token = this.decryptionWithCryptoJS(token);
    return qs.parse(token);
  }

  internalRefreshToken(credentials) {
    let token = this.getAccessToken(credentials);
    let endpointInfo = userService.getSavedEndpointInformation(credentials);
    var basic = authService.getBasicAuth();
    let urlToken = `${this.config.url_token}${this.config.token}`;
    if (endpointInfo && endpointInfo.urlGetToken) {
      urlToken = endpointInfo.urlGetToken;
    }
    let headers = {};
    if (credentials.owner && credentials.owner !== 'undefined') {
      let tenantID = credentials.owner;
      headers = {
        'X-Tenant-ID': tenantID
      };
    }
    let _this = this;
    var bodyFormData = {
      'username': credentials.username,
      'password': credentials.password,
      'grant_type': 'refresh_token',
      'refresh_token': token.refresh_token
    };
    return new Promise((resolve, reject) => {
      return axios({
          url: urlToken,
          method: 'post',
          headers: {
            ...headers,
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': basic
          },
          data: qs.stringify(bodyFormData),
        }).then(response => {
          if (response.data === '' || response.data === undefined) {
            onError('Usuário/senha incorretos.');
            reject();
          } else {
            _this.updateAccessToken(credentials, response.data);
            resolve(response.data);
          }
        })
        .catch(error => {
          _this.clearToken(credentials);
          _this.getRemoteAccessToken(endpointInfo, credentials, (err) => {
            reject(err);
          }, (data) => {
            resolve(data);
          });
        });
    });
  }

  refreshToken(credentials, onError, onSuccess) {
    let token = this.getAccessToken(credentials);
    let endpointInfo = userService.getSavedEndpointInformation(credentials);
    var basic = authService.getBasicAuth();
    let urlToken = `${this.config.url_token}${this.config.token}`;
    if (endpointInfo && endpointInfo.urlGetToken) {
      urlToken = endpointInfo.urlGetToken;
    }
    let headers = {};
    if (credentials.owner && credentials.owner !== 'undefined') {
      let tenantID = credentials.owner;
      headers = {
        'X-Tenant-ID': tenantID
      };
    }
    let _this = this;
    var bodyFormData = {
      'username': credentials.username,
      'password': credentials.password,
      'grant_type': 'refresh_token',
      'refresh_token': token.refresh_token
    }
    return new Promise((resolve, reject) => {
      return axios({
          url: urlToken,
          method: 'post',
          headers: {
            ...headers,
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': basic
          },
          data: qs.stringify(bodyFormData)
        }).then(response => {
          if (response.data === '' || response.data === undefined) {
            onError('Usuário/senha incorretos.');
          } else {
            _this.updateAccessToken(credentials, response.data);
            onSuccess(response.data);
          }
        })
        .catch(error => {
          _this.clearToken(credentials);
          _this.getRemoteAccessToken(endpointInfo, credentials, onError, onSuccess);
        });
    });
  }

  getAccessTokenSaaS(credentials) {
    const KEY_TOKEN_SAAS = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_tokenSaaS`;
    let token = this.config.localStorage.getItem(KEY_TOKEN_SAAS);
    if (!token) {
      return;
    }
    token = this.decryptionWithCryptoJS(token);
    return qs.parse(token);
  }

  refreshTokenSaaS(credentials, onError, onSuccess) {
    let basic = authService.getBasicAuthSaaS();
    let urlToken = `${this.config.url_token}${this.config.token}`;
    let headers = {};
    if (credentials.owner && credentials.owner !== 'undefined') {
      let tenantID = credentials.owner;
      headers = {
        'X-Tenant-ID': tenantID
      };
    }
    let _this = this;
    var bodyFormData = {
      'username': credentials.username,
      'password': credentials.password,
      'grant_type': 'password'
    }
    return new Promise((resolve, reject) => {
      return axios({
          url: urlToken,
          method: 'post',
          headers: {
            ...headers,
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': basic
          },
          data: qs.stringify(bodyFormData),
        }).then(response => {
          if (response.data === '' || response.data === undefined) {
            onError('Usuário/senha incorretos.');
          } else {
            _this.updateAccessTokenSaaS(credentials, response.data);
            onSuccess(response.data);
          }
        })
        .catch(error => {
          _this.clearToken(credentials);
          _this.getRemoteAccessTokenSaaS(credentials, onError, onSuccess);
        });
    });
  }

  internalRefreshTokenSaaS(credentials) {
    let basic = authService.getBasicAuthSaaS();
    let urlToken = `${this.config.url_token}${this.config.token}`;
    let headers = {};
    if (credentials.owner && credentials.owner !== 'undefined') {
      let tenantID = credentials.owner;
      headers = {
        'X-Tenant-ID': tenantID
      };
    }
    let _this = this;
    var bodyFormData = {
      'username': credentials.username,
      'password': credentials.password,
      'grant_type': 'password'
    };
    return new Promise((resolve, reject) => {
      return axios({
          url: urlToken,
          method: 'post',
          headers: {
            ...headers,
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': basic
          },
          data: qs.stringify(bodyFormData),
        }).then(response => {
          if (response.data === '' || response.data === undefined) {
            onError('Usuário/senha incorretos.');
            reject();
          } else {
            _this.updateAccessTokenSaaS(credentials, response.data);
            resolve(response.data);
          }
        })
        .catch(error => {
          _this.clearToken(credentials);
          _this.getRemoteAccessTokenSaaS(credentials, (err) => {
            reject(err);
          }, (data) => {
            resolve(data);
          });
        });
    });
  }

  clear(credentials) {
    this.clearToken(credentials);
    this.clearTokenSaaS(credentials);
  }
  clearToken(credentials) {
    const KEY_TOKEN = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_token`;
    this.config.localStorage.removeItem(KEY_TOKEN);
  }
  clearTokenSaaS(credentials) {
    const KEY_TOKEN_SAAS = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_tokenSaaS`;
    this.config.localStorage.removeItem(KEY_TOKEN_SAAS);
  }

  updateAccessToken(credentials, token) {
    const KEY_TOKEN = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_token`;
    const _token = this.encryptWithCryptoJS(qs.stringify(token));
    this.config.localStorage.setItem(KEY_TOKEN, _token);
  }

  updateAccessTokenSaaS(credentials, token) {
    const KEY_TOKEN_SAAS = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_tokenSaaS`;
    const _token = this.encryptWithCryptoJS(qs.stringify(token));
    this.config.localStorage.setItem(KEY_TOKEN_SAAS, _token);
  }

  getRemoteAccessToken(endpointInfo, credentials, onError, onSuccess) {
    let token = this.getAccessToken(credentials);
    if (token && token !== "null") {
      return new Promise((resolve, reject) => {
        onSuccess(token);
        return;
      });
    } else {
      var basic = authService.getBasicAuth();
      let urlToken = `${this.config.url_token}${this.config.token}`;
      if (endpointInfo && endpointInfo.urlGetToken) {
        urlToken = endpointInfo.urlGetToken;
      }
      let headers = {};
      if (credentials.owner && credentials.owner !== 'undefined') {
        let tenantID = credentials.owner;
        headers = {
          'X-Tenant-ID': tenantID
        };
      }
      let _this = this;
      var bodyFormData = {
        'username': credentials.username,
        'password': credentials.password,
        'grant_type': 'password'
      };

      return new Promise((resolve, reject) => {
        return axios({
            url: urlToken,
            method: 'post',
            headers: {
              ...headers,
              'content-type': 'application/x-www-form-urlencoded',
              'Authorization': basic,
            },
            data: qs.stringify(bodyFormData)
          }).then(response => {
            if (response.data === '' || response.data === undefined) {
              onError('Usuário/senha incorretos.');
            } else {
              _this.updateAccessToken(credentials, response.data);
              onSuccess(response.data);
            }
          })
          .catch(error => {
            if (error.response.data && error.response.data.error === "invalid_grant") {
              onError('Usuário/senha incorretos.')
            } else {
              onError(processErrorMessage(error));
            }
          });
      });
    }
  }

  getRemoteAccessTokenSaaS(credentials, onError, onSuccess) {
    let token = this.getAccessTokenSaaS(credentials);
    if (token && token !== "null") {
      return new Promise((resolve, reject) => {
        onSuccess(token);
        return;
      });
    } else {
      let basic = authService.getBasicAuthSaaS();
      let urlToken = `${this.config.url_token}${this.config.token}`;
      let headers = {};
      if (credentials.owner && credentials.owner !== 'undefined') {
        let tenantID = credentials.owner;
        headers = {
          'X-Tenant-ID': tenantID
        };
      }
      let _this = this;
      var bodyFormData = {
        'username': credentials.username,
        'password': credentials.password,
        'grant_type': 'password'
      };
      return new Promise((resolve, reject) => {
        return axios({
            url: urlToken,
            method: 'post',
            headers: {
              ...headers,
              'content-type': 'application/x-www-form-urlencoded',
              'Authorization': basic
            },
            data: qs.stringify(bodyFormData)
          }).then(response => {
            if (response.data === '' || response.data === undefined) {
              onError('Usuário/senha incorretos.');
            } else {
              _this.updateAccessTokenSaaS(credentials, response.data);
              onSuccess(response.data);
            }
          })
          .catch(error => {
            onError(processErrorMessage(error));
          });
      });
    }
  }

  getSecretKey(){
    return decode(this.config.secretKey);
  }

  encryptWithCryptoJS(plainText) {
    let sk = this.getSecretKey();
    const key = CryptoJS.enc.Utf8.parse(sk);
    const iv1 = CryptoJS.enc.Utf8.parse(sk);
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      keySize: 16,
      iv: iv1,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
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
      padding: CryptoJS.pad.Pkcs7
    });
    return plainText.toString(CryptoJS.enc.Utf8);
  }


}

export const tokenService = new AnterosTokenService();