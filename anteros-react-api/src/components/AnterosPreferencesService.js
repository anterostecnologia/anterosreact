import {
  autoBind
} from './AnterosAutoBind';
var CryptoJS = require("crypto-js");
import { decode, encode } from "universal-base64";
import 'regenerator-runtime/runtime';
import { createLocalStorage } from "localstorage-ponyfill";
import qs from "qs";
import { isBrowser } from "browser-or-node";

const SECRET_KEY = 'dmtUTkhBMnFocWZyY3hzeA==';

export class AnterosPreferencesService {
  constructor() {
    autoBind(this);
    this.config = {};
    if (isBrowser) {
      this._localStorage = createLocalStorage({ mode : "browser" });
    } else {
      this._localStorage = createLocalStorage({ mode : "node"});
    }    
  }

  setConfiguration(config) {
    this.config = config;
  }

  init(localStorage){
    this._localStorage = localStorage;
  }

  getPref(key){
    return this._localStorage.getItem(key);
  }

  saveRemindMe(key, remindMe){
    if (remindMe) {
        this._localStorage.setItem(key, remindMe);
      } else {
        this._localStorage.removeItem(key, remindMe);
      }
  }

  getLoginCredentials(key, data, callback){
    let dataStorage = this._localStorage.getItem(key);
    dataStorage = qs.parse(dataStorage);
    if (dataStorage !== null) {
      dataStorage.forEach((item) => {
        if (data === item.owner) {
          let password = this.decryptionWithCryptoJS(item.password);
          callback(item.owner,item.userName,password,data);
        }
      });
    }
  }

  removeCredentials(key, owner){
    let data = this._localStorage.getItem(key);
    data = qs.parse(data);
    data = data.filter(function(item) {
      return item.owner !== owner;
    });
    this._localStorage.removeItem(key);
    if (data.length > 0) {
      this._localStorage.setItem(key, qs.stringify(data));
    }
  }

  saveLoginCredentials(key, credentials, remindMe){
    let credentialsToStorage = [
        {
          owner: credentials.owner,
          userName: credentials.username,
          password: this.encryptWithCryptoJS(credentials.password),
          url: window.location.href,
        },
      ];
  
      if (this._localStorage.credentials === undefined) {
        this._localStorage.setItem(
          key,
          qs.stringify(credentialsToStorage)
        );
      } else {
        let dataStorage = this._localStorage.getItem(key);
        dataStorage = qs.parse(dataStorage);
        dataStorage.password = this.decryptionWithCryptoJS(dataStorage);
        if (dataStorage==undefined){
          dataStorage = [];
        }
  
        this._localStorage.removeItem(key);
        let hasOwner = false;
        for (let i = 0; i < dataStorage.length; i++) {
          const item = dataStorage[i];
          if (credentialsToStorage[0].owner === item.owner) {
            hasOwner = true;
            if (!remindMe) {
              dataStorage.splice(i, 1);
            }
            break;
          }
        }
  
  
        this._localStorage.setItem(
          key,
          qs.stringify(dataStorage)
        );
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

export const preferencesService =  new AnterosPreferencesService();