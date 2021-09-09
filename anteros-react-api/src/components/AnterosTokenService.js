import axios from 'axios';
import {
  processErrorMessage,
  autoBind
} from '@anterostecnologia/anteros-react-core';
import {authService} from './AnterosAuthenticationService';
import {userService} from './AnterosUserService';
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
    let token = localStorage.getItem(KEY_TOKEN);
    if (!token) {
      return;
    }
    token = CryptoJS.AES.decrypt(atob(token),atob(this.config.secretKey));
    token = token.toString(CryptoJS.enc.Utf8);
    return JSON.parse(token);
  }

  internalRefreshToken(credentials) {
    let token = this.getAccessToken(credentials);
    let endpointInfo = userService.getSavedEndpointInformation(credentials);
    var basic = authService.getBasicAuth();
    let urlToken = `${this.config.url_token}${this.config.token}`;
    if (endpointInfo.urlGetToken) {
      urlToken = endpointInfo.urlGetToken;
    }
    let tenantID = credentials.owner;
    let _this = this;
    var bodyFormData = new FormData();
    bodyFormData.append('username', credentials.username);
    bodyFormData.append('password', credentials.password);
    bodyFormData.append('grant_type', 'refresh_token');
    bodyFormData.append('refresh_token', token.refresh_token);
    return new Promise((resolve, reject) => {
      return axios({
          url: urlToken,
          method: 'post',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': basic,
            'X-Tenant-ID': tenantID
          },
          data: bodyFormData,
        }).then(response => {
          if (response.data === '' || response.data === undefined) {
            onError('Usuário/senha incorretos.');
            reject();
          } else {
            _this.updateAccessToken(credentials,response.data);
            resolve(response.data);
          }
        })
        .catch(error => {
          _this.clearToken(credentials);
          _this.getRemoteAccessToken(endpointInfo, credentials,(err)=>{
              reject(err);
          },(data)=>{
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
    if (endpointInfo.urlGetToken) {
      urlToken = endpointInfo.urlGetToken;
    }
    let tenantID = credentials.owner;
    let _this = this;
    var bodyFormData = new FormData();
    bodyFormData.append('username', credentials.username);
    bodyFormData.append('password', credentials.password);
    bodyFormData.append('grant_type', 'refresh_token');
    bodyFormData.append('refresh_token', token.refresh_token);
    return new Promise((resolve, reject) => {
      return axios({
          url: urlToken,
          method: 'post',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': basic,
            'X-Tenant-ID': tenantID,
          },
          data: bodyFormData
        }).then(response => {
          if (response.data === '' || response.data === undefined) {
            onError('Usuário/senha incorretos.');
          } else {
            _this.updateAccessToken(credentials,response.data);
            onSuccess(response.data);
          }
        })
        .catch(error => {
          _this.clearToken(credentials);
          _this.getRemoteAccessToken(endpointInfo,credentials,onError,onSuccess);
        });
    });
  }

  getAccessTokenSaaS(credentials) {
    const KEY_TOKEN_SAAS = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_tokenSaaS`;
    let token = localStorage.getItem(KEY_TOKEN_SAAS);
    if (!token) {
      return;
    }
    token = CryptoJS.AES.decrypt(atob(token),atob(this.config.secretKey));
    token = token.toString(CryptoJS.enc.Utf8);
    return JSON.parse(token);
  }

  refreshTokenSaaS(credentials, onError, onSuccess) {
    let basic = authService.getBasicAuthSaaS();
    let urlToken = `${this.config.url_token}${this.config.token}`;
    let tenantID = credentials.owner;
    let _this = this;
    var bodyFormData = new FormData();
    bodyFormData.append('username', credentials.username);
    bodyFormData.append('password', credentials.password);
    bodyFormData.append('grant_type', 'password');
    return new Promise((resolve, reject) => {
      return axios({
          url: urlToken,
          method: 'post',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': basic,
            'X-Tenant-ID': tenantID
          },
          data: bodyFormData,
        }).then(response => {
          if (response.data === '' || response.data === undefined) {
            onError('Usuário/senha incorretos.');
          } else {
            _this.updateAccessTokenSaaS(credentials,response.data);
            onSuccess(response.data);
          }
        })
        .catch(error => {
          _this.clearToken(credentials);
          _this.getRemoteAccessTokenSaaS(credentials,onError,onSuccess);
        });
    });
  }

  internalRefreshTokenSaaS(credentials) {
    let basic = authService.getBasicAuthSaaS();
    let urlToken = `${this.config.url_token}${this.config.token}`;
    let tenantID = credentials.owner;
    let _this = this;
    var bodyFormData = new FormData();
    bodyFormData.append('username', credentials.username);
    bodyFormData.append('password', credentials.password);
    bodyFormData.append('grant_type', 'password');
    return new Promise((resolve, reject) => {
      return axios({
          url: urlToken,
          method: 'post',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': basic,
            'X-Tenant-ID': tenantID
          },
          data: bodyFormData,
        }).then(response => {
          if (response.data === '' || response.data === undefined) {
            onError('Usuário/senha incorretos.');
            reject();
          } else {
            _this.updateAccessTokenSaaS(credentials,response.data);
            resolve(response.data);
          }
        })
        .catch(error => {
          _this.clearToken(credentials);
          _this.getRemoteAccessTokenSaaS(credentials,(err)=>{
              reject(err);
          },(data)=>{
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
    localStorage.removeItem(KEY_TOKEN);
  }
  clearTokenSaaS(credentials) {
    const KEY_TOKEN_SAAS = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_tokenSaaS`;
    localStorage.removeItem(KEY_TOKEN_SAAS);
  }

  updateAccessToken(credentials, token) {
    const KEY_TOKEN = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_token`;
    const _token = btoa(CryptoJS.AES.encrypt(JSON.stringify(token),atob(this.config.secretKey)));
    localStorage.setItem(KEY_TOKEN, _token);
  }

  updateAccessTokenSaaS(credentials, token) {
    const KEY_TOKEN_SAAS = `${(credentials.owner ? credentials.owner + "_" : "") + credentials.username}_tokenSaaS`;
    const _token = btoa(CryptoJS.AES.encrypt(JSON.stringify(token),atob(this.config.secretKey)));
    localStorage.setItem(KEY_TOKEN_SAAS, _token);
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
      if (endpointInfo.urlGetToken) {
        urlToken = endpointInfo.urlGetToken;
      }
      let tenantID = credentials.owner;
      let _this = this;
      var bodyFormData = new FormData();
      bodyFormData.append('username', credentials.username);
      bodyFormData.append('password', credentials.password);
      bodyFormData.append('grant_type', 'password');

      return new Promise((resolve, reject) => {
        return axios({
            url: urlToken, 
            method: 'post',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
              'Authorization': basic,
              'X-Tenant-ID': tenantID
            },
            data: bodyFormData
          }).then(response => {
            if (response.data === '' || response.data === undefined) {
              onError('Usuário/senha incorretos.');
            } else {
              _this.updateAccessToken(credentials,response.data);
              onSuccess(response.data);
            }
          })
          .catch(error => {
            if (error.response.data && error.response.data.error === "invalid_grant"){
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
      let tenantID = credentials.owner;
      let _this = this;
      var bodyFormData = new FormData();
      bodyFormData.append('username', credentials.username);
      bodyFormData.append('password', credentials.password);
      bodyFormData.append('grant_type', 'password');
      return new Promise((resolve, reject) => {
        return axios({
            url: urlToken,
            method: 'post',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
              'Authorization': basic,
              'X-Tenant-ID': tenantID
            },
            data: bodyFormData,
          }).then(response => {
            if (response.data === '' || response.data === undefined) {
              onError('Usuário/senha incorretos.');
            } else {
              _this.updateAccessTokenSaaS(credentials,response.data);
              onSuccess(response.data);
            }
          })
          .catch(error => {
            onError(processErrorMessage(error));
          });
      });
    }
  }
}

export const tokenService = new AnterosTokenService();