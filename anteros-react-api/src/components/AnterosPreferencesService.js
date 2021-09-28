import {
  autoBind
} from './AnterosAutoBind';
var CryptoJS = require("crypto-js");
import { decode, encode } from "universal-base64";
import 'regenerator-runtime/runtime';

const SECRET_KEY = 'dmtUTkhBMnFocWZyY3hzeA==';

export class AnterosPreferencesService {
  constructor() {
    autoBind(this);
  }
  init(){
    
  }

  getPref(key){
    return localStorage.getItem(key);
  }

  saveRemindMe(key, remindMe){
    if (remindMe) {
        localStorage.setItem(key, remindMe);
      } else {
        localStorage.removeItem(key, remindMe);
      }
  }

  getLoginCredentials(key, data, callback){
    let dataStorage = localStorage.getItem(key);
    dataStorage = JSON.parse(dataStorage);
    if (dataStorage !== null) {
      dataStorage.forEach((item) => {
        if (data === item.owner) {
          let password = CryptoJS.AES.decrypt(
            decode(item.password),
            decode(SECRET_KEY)
          );
          password = password.toString(CryptoJS.enc.Utf8);
          callback(item.owner,item.userName,password,data);
        }
      });
    }
  }

  removeCredentials(key, owner){
    let data = localStorage.getItem(key);
    data = JSON.parse(data);
    data = data.filter(function(item) {
      return item.owner !== owner;
    });
    localStorage.removeItem(key);
    if (data.length > 0) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  saveLoginCredentials(key, credentials, remindMe){
    let credentialsToStorage = [
        {
          owner: credentials.owner,
          userName: credentials.username,
          password: encode(CryptoJS.AES.encrypt(credentials.password,decode(SECRET_KEY))),
          url: window.location.href,
        },
      ];
  
      if (localStorage.credentials === undefined) {
        localStorage.setItem(
          key,
          JSON.stringify(credentialsToStorage)
        );
      } else {
        let dataStorage = localStorage.getItem(key);
        dataStorage = JSON.parse(dataStorage);
        dataStorage.password = CryptoJS.AES.decrypt(decode(dataStorage.password),decode(SECRET_KEY));
        dataStorage.password = dataStorage.password.toString(CryptoJS.enc.Utf8);
        if (dataStorage==undefined){
          dataStorage = [];
        }
  
        localStorage.removeItem(key);
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
  
        if (remindMe && !hasOwner) {
          dataStorage.push(credentialsToStorage[0]);
        }
  
        localStorage.setItem(
          key,
          JSON.stringify(dataStorage)
        );
      }
  }

}

export const preferencesService =  new AnterosPreferencesService();