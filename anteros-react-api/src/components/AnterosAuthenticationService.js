import {
    autoBind
} from './AnterosAutoBind';
import {tokenService} from './AnterosTokenService';
import axios from "axios";
import {userService} from './AnterosUserService';
import { encode } from "universal-base64";
import 'regenerator-runtime/runtime';

export class AnterosAuthenticationService {

    constructor() {
        this.config = {};
        autoBind(this);
    }

    setConfiguration(config) {
        this.config = config;
    }

    login(ownerUrl, credentials, onError, onSuccess) {
        let token = tokenService.getAccessToken(credentials);
        if (token) {
            return new Promise((resolve, reject) => {
                axios.defaults.headers = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.access_token}`
                  };
                onSuccess(token);
            });
        } else {
            return tokenService.getRemoteAccessToken(ownerUrl, credentials, onError, onSuccess);
        }
    }

    logoff(credentials) {
        tokenService.clear(credentials);  
        userService.clear(credentials);  
    }

    getBasicAuth() {
        return 'Basic ' + encode(this.config.clientId + ":" + this.config.clientSecret);
    }

    getBasicAuthSaaS() {
        return 'Basic ' + encode(this.config.clientIdOwner + ":" + this.config.clientSecretOwner);
    }
}

export const authService = new AnterosAuthenticationService();