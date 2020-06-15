"use strict";

const Client_Credentials_Utils = require("./client_credentials_utils");

//the controller for client_creds.ejs: one for page get and one for form post
class Client_Credentials_Handler {
    
    //get access_token and render page with server data
    static get_access_token(res) {

        const GRANT_TYPE = "client_credentials";

        //config parameters
        const client_creds_config = {
            token_endpoint: process.env.TOKEN_ENDPOINT,
            client_id:      process.env.CLIENT_ID,
            client_secret:  process.env.CLIENT_SECRET,
            grant_type:     GRANT_TYPE,
            scope:          process.env.SCOPE,
        };
        
        //call the promise
        Client_Credentials_Utils.get_access_token_client_creds(client_creds_config)
        .then(response => {
            console.log(response.data);
            const access_token = response.data.access_token;
            res.render("../views/client_creds", {
                access_token: access_token, 
                client_creds_config: client_creds_config,
                response_json: ""
            });
        })
        .catch(error => {
            console.log(error);
            res.render("../views/client_creds", {
                access_token: error,
                client_creds_config: client_creds_config,
                response_json: ""
            });
        });
    }

    //used by Form Post
    static post_access_token(req, res) {
        //config parameters
        const client_creds_config = {
            token_endpoint: req.body.token_endpoint,
            client_id:      req.body.client_id,
            client_secret:  req.body.client_secret,
            grant_type:     req.body.grant_type,
            scope:          req.body.scope
        };
        
        //call the promise to get access_token, also test a REST API and show both results in the postback
        Client_Credentials_Utils.get_access_token_client_creds(client_creds_config)
        .then(response => {
            console.log(response.data);
            const access_token = response.data.access_token;

            //Test a REST API using client_credentials flow 
            const url = "https://graph.microsoft.com/beta/users";
            const method = "GET";
            const body = null;
            Client_Credentials_Utils.call_rest_api(url, method, body)
            .then(response => { 
                const response_json = JSON.stringify(response.data, undefined, 4);
                console.log();
                res.render("../views/client_creds", {
                    access_token: access_token, 
                    client_creds_config: client_creds_config,
                    response_json: response_json
                });
            })
            .catch(error => {
                console.log(error);
                res.render("../views/client_creds", {
                    access_token: access_token, 
                    client_creds_config: client_creds_config,
                    response_json: error
                });
            })
            
        })
        .catch(error => {
            console.log(error);
            res.render("../views/client_creds", {
                access_token: error, 
                client_creds_config: client_creds_config,
                response_json: ""
            });
        });
 
    }

}

module.exports = Client_Credentials_Handler;