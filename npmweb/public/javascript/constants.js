"use strict";

//All default constants used. Replace them by yours.

//default settings for MSAL, used in oauth20.
//CLIENT_ID & TENANT_ID are determined upon page load while SCOPE is determined when login, so can be changed thru UI.
class OAUTH2_CONST {
    static get CLIENT_ID() {
        return "9480ba15-fdf8-46ca-8745-5950e1d56b15";      //srt-client-app in willzhanad
        //return "7eaede8d-6b12-4c81-9414-70309fec1e95";    //client-app-01 in willzhanoutlook.onmicrosoft.com
    }

    static get TENANT_ID() {
        return "51641c40-ad65-4736-88fc-2f0e10072d85";      //willzhanad.onmicrosoft.com
        //return "1aaaabcc-73b2-483c-a2c7-b9146631c677";    //willzhanoutlook.onmicrosoft.com
    }

    static get SCOPE() {
        return "api://79b0c254-f7c2-49dd-9a43-97d15873ea1b/Files.Read offline_access";
    }

    //AAD, AAD B2C, ADFS use different IDP URLs.
    static get IDENTITY_PROVIDER() {
        return "https://login.microsoftonline.com/";
    }

    //for information only
    static get MSAL_VERSION() {
        return "@azure/msal-browser v 2.0.0-beta";
    }
}



//constants for the list of APIs to test. Used in api.js file.
class API_CONST {
    static get API_LIST () {
        return {
            separator_0: {
                display: "---------- Custom REST API (single-tenant)",
                url: "",
                method: "",
                body: "",
                info: "Not a test case. "
            },
            list: {
                display: "Custom REST API - List all",
                url: "https://lorentz-apimgmt.azure-api.net/nodes",
                method: "GET",
                body: "",
                info: "List all data"
            },
            query: {
                display: "Custom REST API - Filter, pagination, sort",
                url: "https://lorentz-apimgmt.azure-api.net/nodes?customMetadata.vendor=Avid&skip=0&limit=3&sort=nodeName:desc",
                method: "GET",
                body: "",
                info: "You can filter on any attribute, including customMetadata attributes. You can also paginate and sort."
            },
            delete: {
                display: "Custom REST API - Delete",
                url: "https://lorentz-apimgmt.azure-api.net/nodes/98ac6960-0d2b-45c1-bfb1-8b14cd18eff4",
                method: "DELETE",
                body: "",
                info: "Make sure to replace the ID in the URL by the nodeId you want to delete."
            },
            create: {
                display: "Custom REST API - Create",
                url: "https://lorentz-apimgmt.azure-api.net/nodes",
                method: "POST",
                body: "",
                info: "You may modify the attribute values and/or use any attributes/values in customMetadata."
            },
            update: {
                display: "Custom REST API - Update",
                url: "https://lorentz-apimgmt.azure-api.net/nodes/d0a65219-12ad-4334-afca-ec38014ae251",
                method: "PUT",
                body: "",
                info: "Paste into the node content you want to update and modify its values. Also replace the nodeId in the URL."
            },
            get: {
                display: "Custom REST API - Find one",
                url: "https://lorentz-apimgmt.azure-api.net/nodes/d0a65219-12ad-4334-afca-ec38014ae251",
                method: "GET",
                body: "",
                info: "Replace the ID by an existing nodeId to get one in response."
            },
            separator_1: {
                display: "---------- Microsoft Graph (multi-tenant)",
                url: "",
                method: "",
                body: "",
                info: "Not a test case. "
            },
            graph_api_me: {
                display: "Graph API - me",
                url: "https://graph.microsoft.com/beta/me",
                method: "GET",
                body: "",
                info: "Must use a Graph API scope such as https://graph.microsoft.com/profile"
            },
            graph_api_memberof: {
                display: "Graph API - memberOf",
                url: "https://graph.microsoft.com/beta/me/memberOf",
                method: "GET",
                body: "",
                info: "Must use a Graph API scope such as https://graph.microsoft.com/profile"
            },
            graph_api_groups: {
                display: "Graph API - groups",
                url: "https://graph.microsoft.com/beta/groups",
                method: "GET",
                body: "",
                info: "Must use a Graph API scope such as https://graph.microsoft.com/profile"
            },
            graph_api_serviceprincipals: {
                display: "Graph API - service principals",
                url: "https://graph.microsoft.com/beta/serviceprincipals",
                method: "GET",
                body: "",
                info: "Must use a Graph API scope such as https://graph.microsoft.com/profile"
            },
            graph_api_presence: {
                display: "Graph API - presence",
                url: "https://graph.microsoft.com/beta/me/presence",
                method: "GET",
                body: "",
                info: "Must use a Graph API scope such as https://graph.microsoft.com/Presence.Read. Presence API requires Teams deployment."
            },
            graph_api_profile: {
                display: "Graph API - profile",
                url: "https://graph.microsoft.com/beta/me/profile",
                method: "GET",
                body: "",
                info: "Must use a Graph API scope such as https://graph.microsoft.com/Presence.Read. "
            },
            graph_api_users: {
                display: "Graph API - users",
                url: "https://graph.microsoft.com/beta/users",
                method: "GET",
                body: "",
                info: "Must use a Graph API scope such as https://graph.microsoft.com/Presence.Read. "
            },
            graph_api_organization: {
                display: "Graph API - organization",
                url: "https://graph.microsoft.com/beta/organization",
                method: "GET",
                body: "",
                info: "Must use a Graph API scope such as https://graph.microsoft.com/Presence.Read. "
            },
            graph_api_oauth2PermissionGrants: {
                display: "Graph API - oauth2PermissionGrants",
                url: "https://graph.microsoft.com/beta/me/oauth2PermissionGrants",
                method: "GET",
                body: "",
                info: "Must use a Graph API scope such as https://graph.microsoft.com/Presence.Read. "
            },
            separator_2: {
                display: "---------- Azure Media Services (multi-tenant)",
                url: "",
                method: "",
                body: "",
                info: "Not a test case. "
            },
            ams_drm: {
                display: "Key Delivery API - DRM/AES-128",
                url: "",
                method: "GET",
                body: "",
                info: "This test case is done on AMS tab."
            },
            // separator_3: {
            //     display: "---------- Kafka REST Proxy (multi-tenant)",
            //     url: "",
            //     method: "",
            //     body: "",
            //     info: "Not a test case. "
            // },
            // kafka_topics: {
            //     display: "Kafka - topics",
            //     url: "https://clustkafka-kafkarest.azurehdinsight.net/v1/metadata/topics",
            //     method: "GET",
            //     body: "",
            //     info: "Get list of topics in Kafka"
            // },
            // kafka_partitions: {
            //     display: "Kafka - partitions",
            //     url: "https://clustkafka-kafkarest.azurehdinsight.net/v1/metadata/topics/nodeUpdate/partitions",
            //     method: "GET",
            //     body: "",
            //     info: "Get list of partitions of a topic"
            // },
            // kafka_produce: {
            //     display: "Kafka - produce",
            //     url: "https://clustkafka-kafkarest.azurehdinsight.net/v1/producer/topics/nodeUpdate",
            //     method: "POST",
            //     body: "",
            //     info: "Produce records"
            // },
            // kafka_consume: {
            //     display: "Kafka - consume",
            //     url: "https://clustkafka-kafkarest.azurehdinsight.net/v1/consumer/topics/nodeUpdate/partitions/0/offsets/0 ",
            //     method: "GET",
            //     body: "",
            //     info: "Consume records"
            // },
      } ;
    }
}


//defaults in ams.js
class AMS_CONST {
    static get DEFAULT_URL() {
        return "https://eventgridmediaservice-usw22.streaming.media.azure.net/9591e337-ae90-420e-be30-1da36c06665b/MicrosoftElite01.ism/manifest(format=mpd-time-csf,encryption=cenc)";
    }
    
    //FairPlay application cert URL
    static get APP_CERT_URL() {
        return `${window.location.href}cert/FPSAC.cer`;
    }
}


//scopes constants
class SCOPE_CONST {
    static get SCOPE_LIST() {
        return [
            {
                name: "Microsoft Graph API scopes (consent granted)",
                scopes: [
                    "https://graph.microsoft.com/Directory.Read.All offline_access",
                    "https://graph.microsoft.com/Files.Read offline_access",
                    "https://graph.microsoft.com/Group.Read.All offline_access",
                    "https://graph.microsoft.com/GroupMember.Read.All offline_access",
                    "https://graph.microsoft.com/IdentityProvider.Read.All offline_access",
                    "https://graph.microsoft.com/profile offline_access",
                    "https://graph.microsoft.com/User.Read offline_access",
                    "https://graph.microsoft.com/Presence.Read offline_access"
                ]
            },
            {
                name: "REST API scope (consent granted)",
                scopes: [
                    OAUTH2_CONST.SCOPE 
                ]
            },
            {
                name: "DRM license delivery service scope (consent granted)",
                scopes: [
                    OAUTH2_CONST.SCOPE +                                                          " <br/> &emsp; &emsp; ( https://eventgridmediaservice-usw22.streaming.media.azure.net/9591e337-ae90-420e-be30-1da36c06665b/MicrosoftElite01.ism/manifest(format=mpd-time-csf,encryption=cenc) )",
                    "api://df4ed433-dbf0-4da6-b328-e1fe05786db5/DRM.License.Delivery offline_access <br/> &emsp; &emsp; ( https://eventgridmediaservice-usw22.streaming.media.azure.net/b7b1fc25-de61-49c2-9250-34e0f27a4ba1/MicrosoftElite01.ism/manifest(format=mpd-time-csf,encryption=cenc) )"
                ]
            },
            {
                name: "Kafka REST Proxy scope",
                scopes: [
                    "https://hib.azurehdinsight.net/.default"
                ]
            }

        ];
    }
}