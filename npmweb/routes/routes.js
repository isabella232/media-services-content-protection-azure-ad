"use strict";

const path = require("path");
const handler = require("../controllers/client_credentials_handler");

const routeDefinition = (app) => {

    //add path-page-type-method mappings here, to define all the routes
    const mappings = [
        { 
            path: "/",
            page: "index",
            type: "ejs",
            method: "get"
        },
        {
            path: "/jwt",
            page: "jwt",
            type: "ejs",
            method: "get"
        },
        {
            path: "/client_creds",
            page: "client_creds",
            type: "ejs",
            method: "get"
        },
        {
            path: "/client_creds",
            page: "client_creds",
            type: "ejs",
            method: "post"
        },
        {
            path: "/info",
            page: "info",
            type: "ejs",
            method: "get"
        },
        {   
            path: "/index.html",
            page: "index.html",
            type: "html",
            method: "get"
        }
    ];

    mappings.forEach((item, index) => {
        switch (item.method) {
            case "get":   //GET methods
                app.get(item.path, (req, res) => {
                    switch (item.type)
                    {
                        case "ejs":
                            switch (item.page) {
                                case "client_creds":
                                    handler.get_access_token(res);
                                    break;
                                default:
                                    res.render(item.page);
                            }
                            break;
                        case "html":
                            res.sendFile(item.page, {
                                root: path.join(__dirname, "../views/")
                            });
                            break;
                        default:
                            console.error("Routes: a path-page mapping needs correct type attribute.")
                    } 
                })
                break;
            case "post":  //POST methods
                app.post(item.path, (req, res) => {
                    switch (item.type)
                    {
                        case "ejs":
                            switch (item.page) {
                                case "client_creds":
                                    handler.post_access_token(req, res);
                                    break;
                                default:
                                    console.error("Routes: not yet defined.")
                            }
                            break;
                        default:
                            console.error("Routes: not yet defined.")
                    }
                })
                break;
            default:
                console.error("Routes: not yet defined.")
        }
        
    })
    
}

module.exports = routeDefinition;