"use strict"

const axios = require("axios");

class Client_Credentials_Utils {
    //cache for access_token, for all callers, all sharing the same client_credentials
    static _access_token = null;

    //get access_token returning a promise with access_token as response.
    //check: this._access_token has cached value or not, and check cached this._access_token has not expired
    static prepare_rest_api_call() {
        return new Promise((resolve, ) => {
            //check token expiration

            if (this._access_token == null) {
                console.log("this._access_token not available, acquire access_token"); 
                this.get_access_token()
                .then(response => {
                    this._access_token = response.data.access_token;
                    resolve(this._access_token);
                })
                .catch(error => {
                    console.error(error);
                    reject(error);
                })
            } else {
                //use this._access_token
                console.log("using cached this._access_token value");
                resolve(this._access_token);
            }
        })
    }

    //call REST API with client_credentials access_token, returning a promise
    static call_rest_api(url, method, body) {
        return this.prepare_rest_api_call()
        .then(access_token => {
            return this.do_fetch(url, method, body, access_token);
        })
        .catch(error => {
            console.log(error);
        });
    }

    //method for getting access token using .env config and the utility method get_access_token_client_creds (Promise)
    static get_access_token() {

        const GRANT_TYPE = "client_credentials";

        //config parameters
        const client_creds_config = {
            token_endpoint: process.env.TOKEN_ENDPOINT,
            client_id:      process.env.CLIENT_ID,
            client_secret:  process.env.CLIENT_SECRET,
            grant_type:     GRANT_TYPE,
            scope:          process.env.SCOPE,
        };

        return this.get_access_token_client_creds(client_creds_config);
    }

    //method for getting access token via client credentials flow using axios (Promise)
    static get_access_token_client_creds(client_creds_config) {
        
        const body = `grant_type=${client_creds_config.grant_type}&scope=${encodeURIComponent(client_creds_config.scope)}&client_id=${client_creds_config.client_id}&client_secret=${encodeURIComponent(client_creds_config.client_secret)}`;
        
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        };

        const options = {"headers": headers};
        return axios.post(client_creds_config.token_endpoint, body, options);   //promise
    }

    //generic REST call via axios, returning a promise
    static do_fetch(url, method, body, access_token) {
        const headers = {
            "Authorization": `Bearer ${access_token}`,
            "Content-Type": "application/json",
        }

        const options = {"headers": headers};

        let request;
        switch (method.toUpperCase()) {
            case "GET":
                request = axios.get(url, options);
                break;
            case "POST":
                request = axios.post(url, body, options);
                break;
            default:
                request = axios.get(url, options);
        }
        return request; //promise
    }
}


module.exports = Client_Credentials_Utils;