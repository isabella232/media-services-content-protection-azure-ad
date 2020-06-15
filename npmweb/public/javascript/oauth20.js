"use strict";

//********************************************************
//WHAT: Secure access to backend resources thru OAuth 2.0 
//WHICH FLOW: authorization code flow with PKCE
//WHICH CLIENT LIBRARY: @azure/msal-browser v2.0 beta
//WHICH BACKEND RESOURCES TO ACCESS:
//      REST API (SRT Registry Service - Project Lorentz)
//      Microsoft Graph API
//      AMS license delivery service
//WHO:  willzhan@microsoft.com
//WHEN: 2020
//HOW:  in JS ES6
//********************************************************


//msal.PublicClientApplication(msalConfig)
let msalInstance;

//centralized post-login data cache
const msalCache = {
  access_token:  null,
  access_token2: null,
  refersh_token: null,
  id_token:      null,
  expiresOn:     null,
  userename:     null,
  name:          null
};

//const strings used in both IDP and STS
const JWT_PARSER_URL = "./jwt";
const CLOSE          = "<a href='javascript: STS.close_token_display();' class='close-icon'></a>";
const API_MODE = {
  POPUP: "popup",
  REDIRECT: "redirect"
};

//********************************************************
//IDP for authentication
//********************************************************
class IDP {

  //initialize msalInstance (called on pageload)
  static initMsalBrowser() {
    //modified index.js from msal-browser install. Details see javascript/index.js
    const msalConfig = {
      auth: {
        clientId:                  document.getElementById("client_id").value,
        authority:                 OAUTH2_CONST.IDENTITY_PROVIDER + document.getElementById("tenant_id").value,
        redirectUri:               document.getElementById("msal_redirect_uri").value,
        navigateToLoginRequestUrl: true
      },
      cache: {
        cacheLocation: "sessionStorage",   //or localStorage
        storeAuthStateInCookie: false      //set to true if supporting IE
      },
      system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case "Error":     //LogLevel.Error:
                      console.error(message);
                      break;
                    case "Info":      //LogLevel.Info:
                      console.info(message);
                      break;
                    case "Verbose":   //LogLevel.Verbose:
                      console.debug(message);
                      break;
                    case "Warning":   //LogLevel.Warning:
                      console.warn(message);
                      break;
                    default:
                      console.debug(message);
                }
            },
            piiLoggingEnabled: true
        },
        windowHashTimeout: 60000    //Timeout in milliseconds to wait for popup or iframe authentication to resolve.
      }
    };

    //print to verify the input values
    console.log("msalConfig.auth.clientId: "                  + msalConfig.auth.clientId);
    console.log("msalConfig.auth.authority: "                 + msalConfig.auth.authority);
    console.log("msalConfig.auth.redirectUri: "               + msalConfig.auth.redirectUri);
    console.log("msalConfig.auth.navigateToLoginRequestUrl: " + msalConfig.auth.navigateToLoginRequestUrl);

    msalInstance = new msal.PublicClientApplication(msalConfig);
    console.log("msalInstance: ", msalInstance);

    return msalInstance;
  }

  //********************************************************
  //login (popup, redirect) logout
  //********************************************************

  //promise approach for pupup login
  static login_popup() {
    //get scope values
    const loginRequest = MsalSettingsManager.scopes;

    //call promise
    msalInstance.loginPopup(loginRequest)
    .then(loginResponse => {
      IDP.processLoginResponse(loginResponse, msalInstance);
    })
    .catch(err => {
      console.log("Login (popup) error: ", err);
    });
  };

  static login_redirect() {
      const loginRequest = MsalSettingsManager.scopes;
      
      try {
          msalInstance.loginRedirect(loginRequest);  
          //const myAccount = msalInstance.getAccount(); 
          //console.log("msalInstance.getAccount(): ", myAccount);
      } catch (err) {
          console.log("loginRedirect() err:", err);
      }
  }


  //common methods shared between popup and redirect
  static login() {

    //putting the following code here causes redirect mode not working
    // //initialize msal-browser 2.0
    // msalInstance = IDP.initMsalBrowser();

    // //The redirect APIs do not use Promises, but are void functions which redirect the browser window after caching some basic info.
    // //The following is necessary in order to process the returning fragment containing the code and response and obtain an access token
    // msalInstance.handleRedirectCallback(IDP.authRedirectCallBack);


    //get API mode: popup vs redirect
    const selectedValue = MsalSettingsManager.loginApiMode;
    console.log("selected radio value = " + selectedValue);

    //persist current user-specified msalSettings to sessionStorage
    MsalSettingsManager.persistMsalSettings();

    switch (selectedValue) {
      case API_MODE.POPUP:
        IDP.login_popup();
        break;
      case API_MODE.REDIRECT:
        IDP.login_redirect();
        break;
      default:
    }
  }

  static logout() {
    if (msalInstance) {
      msalInstance.logout();
    } else {
      window.alert("Not logged in.");
    }

    //clear sessionStorage
    sessionStorage.clear();
  }

  static login_out() {
    const login_link = document.getElementById("login_link");
    if (login_link.innerHTML === "Login"){
      IDP.login();
    } else {
      IDP.logout();
    }
  }

  //display tokens
  static processLoginResponse(loginResponse, msalInstance) {
    console.log("Login (popup) successful!");
    console.log("loginRespponse: ", loginResponse);
    console.log("msalInstance.config: ", msalInstance.config);
  
    const myAccount = msalInstance.getAccount();
    console.log("myAccount: ", myAccount);
    
    msalCache.access_token   = loginResponse.accessToken;
    msalCache.refresh_token  = loginResponse.refreshToken;
    msalCache.id_token       = myAccount.idToken;
    msalCache.expiresOn      = loginResponse.expiresOn;
    msalCache.username       = myAccount.userName;
    msalCache.name           = myAccount.name;
    
    const access_token_parse_anchor = "<a href='" + JWT_PARSER_URL + "?jwt=" +  msalCache.access_token + "' target='_blank'>parse</b></a>";
    const id_token_parse_anchor     = "<a href='" + JWT_PARSER_URL + "?jwt=" +  msalCache.id_token     + "' target='_blank'>parse</a>";

    document.getElementById("token_display").innerHTML 
    = CLOSE
    + "<b>userName:</b> "                         + msalCache.username
    + "<br/><br/><b>access_token:</b>"            + access_token_parse_anchor
    + "<br/>"                                     + msalCache.access_token
    + "<br/><br/><b>refresh_token:</b><br/> "     + msalCache.refresh_token 
    + "<br/><br/><b>id_token:</b>"                + id_token_parse_anchor  
    + "<br/>"                                     + msalCache.id_token
    + "<br/><br/><b>expiresOn:</b> "              + msalCache.expiresOn
    + "<br/><br/><b>cacheLocation:</b> "          + msalInstance.config.cache.cacheLocation
    + "<br/><br/><b>storeAuthStateInCookie:</b> " + msalInstance.config.cache.storeAuthStateInCookie
    + "<br/><br/><b>environment:</b> "            + myAccount.environment
    + "<br/><br/><b>accountIdentifier:</b> "      + myAccount.accountIdentifier
    + "<br/><br/><b>homeAccountIdentifier:</b> "  + myAccount.homeAccountIdentifier
    ; 

    //change text to "Logout" and show logged-in username
    const login_link = document.getElementById("login_link");
    login_link.innerHTML = "Logout";
    const user_name = document.getElementById("user_name");
    user_name.innerHTML = "<span class='tooltip'>" 
                        + msalCache.name 
                        + "<span class='tooltiptext'>Allows any accounts from Microsoft Identity Platform.</span></span>" 
                        + "<a href='javascript: IDP.login();'>" + msalCache.username + "</a>";
    
    //show post-login controls
    const access_token_link = document.getElementById("access_token_link");
    access_token_link.style.display = "inline";
    const token_display = document.getElementById("token_display");
    token_display.style.display = "block";

    toggleVisibility("div_oauth20");

    //populate access_token on AMS tab
    document.getElementById("jwt").value = msalCache.access_token;
  }

  static authRedirectCallBack(error, response) {
    //restore user selection of API type after redirect
    MsalSettingsManager.loginApiMode = "redirect";
  
    //handle loginRedirect response
    if (error) {
        console.log("authRedirectCallback error", error);
    } else {
        if (msalInstance.getAccount()) {
            //console.log('id_token acquired at: ' + new Date().toString());
            //showWelcomeMessage(myMSALObj.getAccount());
            //getTokenRedirect(loginRequest);
            IDP.processLoginResponse(response, msalInstance);
        } else if (response.tokenType === "Bearer") {
            console.log('access_token acquired at: ' + new Date().toString());
        } else {
            console.log("token type is:" + response.tokenType);
        }
    }
  }

}  //IDP


//********************************************************
//STS/JWT
//********************************************************
class STS {

  static get_access_token() {

    if (msalInstance == undefined || msalInstance == null) {
      window.alert("Must login first to acquire access_token.");
      return;
    }
    
    const request = MsalSettingsManager.scopes;

    //call promise
    msalInstance.acquireTokenSilent(request)
    .then(tokenResponse => {
      STS.processTokenResponse(tokenResponse);
    })
    .catch((error) => {
    //.catch(async (error) => {
      console.log("silent token acquisition fails.");
      //for Microsoft tenant msal.InteractionRequiredAuthError could be null, but not for custom tenant
      if (msal.InteractionRequiredAuthError != null && msal.InteractionRequiredAuthError != undefined) {
        if (error instanceof msal.InteractionRequiredAuthError) {
          if (msal.InteractionRequiredAuthError.isInteractionRequiredError(error.errorCode, error.errorDesc)) {
              // fallback to interaction when silent call fails
              console.log("acquiring token using popup");
              return msalInstance.acquireTokenPopup(request)
              .catch(error => {
                  console.error(error);
              });
          }
        } else {
          console.error(error);
        }
      }
      else {
        return msalInstance.acquireTokenPopup(request)
        .catch(error => {
            console.error(error);
        });
      }
    });

  }    

  //update msalCache by tokenResponse and display
  static processTokenResponse(tokenResponse) {
      console.log("tokenResponse: ", tokenResponse);
      msalCache.access_token  = tokenResponse.accessToken;
      msalCache.refresh_token = tokenResponse.refreshToken;
      msalCache.id_token      = tokenResponse.idToken
      msalCache.expiresOn     = tokenResponse.expiresOn;

      const access_token_parse_anchor = "<a href='" + JWT_PARSER_URL + "?jwt=" + msalCache.access_token + "' target='_blank'>parse</a>";
      const id_token_parse_anchor     = "<a href='" + JWT_PARSER_URL + "?jwt=" + msalCache.id_token     + "' target='_blank'>parse</a>";

      document.getElementById("token_display").innerHTML 
      = CLOSE
      + "<b>access_token:</b>"                 + access_token_parse_anchor
      + "<br/>"                                + msalCache.access_token
      + "<br/><br/><b>refresh_token:</b><br/>" + msalCache.refresh_token
      + "<br/><br/><b>id_token: </b> "         + id_token_parse_anchor
      + "<br/>"                                + msalCache.id_token
      + "<br/><br/><b>expiresOn:</b> "         + msalCache.expiresOn
      ;

      const token_display = document.getElementById("token_display");
      token_display.style.display = "block";

      //populate access_token
      document.getElementById("jwt").value = msalCache.access_token;
  }

  static close_token_display() {
    document.getElementById("token_display").style.display = "none";
  }

}  //STS


//********************************************************
//MSAL settigs (both user revised and intial default settings): 
//persistence into/retrieval from sessionStorage, getter, sessionStorage key 
//********************************************************

class MsalSettingsManager {

  //get/set user selected MSAL API selection: popup vs redirect
  static get loginApiMode() {
    let selectedValue = API_MODE.POPUP;
    const radios = document.getElementsByName("api_type"); 
     
    radios.forEach((item, index) => {
      if (item.checked)
        selectedValue = item.value;
    })

    return selectedValue;
  }

  static set loginApiMode(value) {
    const radios = document.getElementsByName("api_type"); 
    radios.forEach((item, index) => {
      if (item.value.toLowerCase() === value.toLocaleLowerCase())
        item.checked = true;
      else
        item.checked = false;
    })
  }

  static get cacheSettings() {
    return document.getElementById("cache_settings").checked;
  }

  static get displaySettings() {
    return document.getElementById("display_settings").checked;
  }

  static set displaySettings(value) {
    document.getElementById("display_settings").checked = value;
  }

  //getter for getting user inputs of scopes {scopes: array}
  static get scopes() {
    const scope_string = document.getElementById("scope").value;
    if (typeof scope_string != "undefined" && scope_string) {
      console.log(scope_string);
      return {
        scopes: scope_string.split(" ")
      };
    } else {
      console.error("Incorrect or missing scope input");
      return null;
    }
  }

  //sessionStorage key for msalSettings
  static get KEY_MSAL_SETTINGS() {
    return "msal_settings_sessionStorage_key";   
  }

  //default settings
  static getInitialMsalSettings() {
    //configured AAD tenant and registered apps 
    const client_id    = OAUTH2_CONST.CLIENT_ID,
          tenant_id    = OAUTH2_CONST.TENANT_ID,
          scope        = OAUTH2_CONST.SCOPE,
          idp          = OAUTH2_CONST.IDENTITY_PROVIDER,
          redirect_uri = window.location.href,
          api_type     = MsalSettingsManager.loginApiMode,
          msal_version = OAUTH2_CONST.MSAL_VERSION;
    
    return {
        client_id:         client_id,
        tenant_id:         tenant_id,
        scope:             scope,
        idp:               idp,
        redirect_uri:      redirect_uri,
        api_type:          api_type,
        authz_endpoint_v2: `${OAUTH2_CONST.IDENTITY_PROVIDER}${tenant_id}/oauth2/v2.0/authorize`,
        token_endpoint_v2: `${OAUTH2_CONST.IDENTITY_PROVIDER}${tenant_id}/oauth2/v2.0/token`,
        openid_config:     `${OAUTH2_CONST.IDENTITY_PROVIDER}${tenant_id}/v2.0/.well-known/openid-configuration`,
        msal_version:      msal_version
    };
  }


  //retrieve MSAL settings from default constant or sessionStorage
  static getMslSettings() {
    let msalSettings;
    //try to retrieve from sessionStorage
    const msal_settings_session_storage = sessionStorage.getItem(MsalSettingsManager.KEY_MSAL_SETTINGS);
    if (msal_settings_session_storage) {
      msalSettings = JSON.parse(msal_settings_session_storage);
      console.log("msalSettings from sessionStorage");
    } else {
      msalSettings = MsalSettingsManager.getInitialMsalSettings();
      console.log("msalSettings from inital default");
      //optionally, add to sessionStorage
      sessionStorage.setItem(MsalSettingsManager.KEY_MSAL_SETTINGS, JSON.stringify(msalSettings));  
    }

    return msalSettings;
  }

  //populate login module UI: MSAL settings
  static populateMsalSettings() {
    const msalSettings = MsalSettingsManager.getMslSettings();

    document.getElementById("client_id").value         = msalSettings.client_id;
    document.getElementById("tenant_id").value         = msalSettings.tenant_id;
    document.getElementById("scope").value             = msalSettings.scope;
    document.getElementById("idp").value               = msalSettings.idp;
    document.getElementById("msal_redirect_uri").value = msalSettings.redirect_uri;

    //add display info into the table
    const table = document.getElementById("login_module_table");
    const tbody = table.getElementsByTagName("tbody")[0];
    let dataRow;
    const rows_inner_html = [
      `<tr><td>MSAL version:</td><td>${msalSettings.msal_version}</td></tr>`,
      `<tr><td>OAuth2 AuthZ endpoint v2:</td><td>${msalSettings.authz_endpoint_v2}</td></tr>`,
      `<tr><td>OAuth2 Token endpoint v2:</td><td>${msalSettings.token_endpoint_v2}</td></tr>`,
      `<tr><td>OpenID-config v2:</td><td><a href='${msalSettings.openid_config}' target='_blank'>${msalSettings.openid_config}</a></td></tr>`
    ];

    for (let i = 0; i < rows_inner_html.length; i++) {
      dataRow = tbody.insertRow();
      dataRow.innerHTML = rows_inner_html[i];
    }

    //populate the datalist for available scopes
    const option_values = [];
    //adding OAUTH2_CONST.SCOPE 
    option_values.push(OAUTH2_CONST.SCOPE);
    //adding SCOPE_CONST.SCOPE_LIST[0].scopes
    SCOPE_CONST.SCOPE_LIST[0].scopes.forEach((item, index) => {
      option_values.push(item);
    })
    //adding Kafka scope
    option_values.push(SCOPE_CONST.SCOPE_LIST[3].scopes[0]);
    //adding api://df4ed433-dbf0-4da6-b328-e1fe05786db5/DRM.License.Delivery offline_access
    //option_values.push("api://df4ed433-dbf0-4da6-b328-e1fe05786db5/DRM.License.Delivery offline_access");

    this.populateScopeList("scope_list", option_values);
  }

  //populate a datalist with an array of option values.
  static populateScopeList(datalist_id, option_values) {
    const datalist = document.getElementById(datalist_id);
    let option;
    
    //adding to datalist
    option_values.forEach((item, index) => {
      option = document.createElement("option");
      option.value = item;
      datalist.appendChild(option);
    })
  }

  //store current user specified MSAL settings into sessionStorage for in-session reuse
  static persistMsalSettings() {

    if (this.cacheSettings) {
      //configured AAD tenant and registered apps 
      const client_id    = document.getElementById("client_id").value,
            tenant_id    = document.getElementById("tenant_id").value,
            scope        = document.getElementById("scope").value ,
            idp          = document.getElementById("idp").value,
            redirect_uri = window.location.href,
            api_type     = MsalSettingsManager.loginApiMode;
      
      const msalSettings = {
        client_id:         client_id,
        tenant_id:         tenant_id,
        scope:             scope,
        idp:               idp,
        redirect_uri:      redirect_uri,
        api_type:          api_type,
        authz_endpoint_v2: `${idp}${tenant_id}/oauth2/v2.0/authorize`,
        token_endpoint_v2: `${idp}${tenant_id}/oauth2/v2.0/token`,
        openid_config:     `${idp}${tenant_id}/v2.0/.well-known/openid-configuration`,
        msal_version:      OAUTH2_CONST.MSAL_VERSION
      };

      sessionStorage.setItem(MsalSettingsManager.KEY_MSAL_SETTINGS, JSON.stringify(msalSettings));
    }
  }

  static cacheSettings_change() {
    if (!this.cacheSettings) {
      sessionStorage.clear();
    }
  }

  //show/hide the MSAL settings div with id = "msal_settings"
  static show_hide_msal_settings() {
    const msal_settings = document.getElementById("msal_settings");
    if (msal_settings.style.display === "none") {
      msal_settings.style.display = "block";
      this.displaySettings = true;
    } else {
      msal_settings.style.display = "none";
      this.displaySettings = false;
    }
  }


}  //MsalSettingsManager



//********************************************************
//actions on page load
//********************************************************

//since msalConfig parameters are UI driven, we have to wait for page load to complete before instantiating msalInstance
window.onload = () => {

  //initialize msal-browser 2.0
  msalInstance = IDP.initMsalBrowser();

  //The redirect APIs do not use Promises, but are void functions which redirect the browser window after caching some basic info.
  //The following is necessary in order to process the returning fragment containing the code and response and obtain an access token
  msalInstance.handleRedirectCallback(IDP.authRedirectCallBack);

  // //populate login module UI: MSAL settings
  // MsalSettingsManager.populateMsalSettings();

  //populate REST API select options (dropdown in REST API test)
  populateApiSelectOptions();

  //populate AMS UI (dropdown in AMS content protection test), source URL and AC
  AMS.populateAmsUi();
}  


//Test code to be deleted
//getData_async().then(x =>{ console.log(x); }).catch(err => { console.log(err); });
 async function getData_async() {
  await delay(3000);
  return "from getData_async() with a promise";
}

const delay = ms => new Promise(res => setTimeout(res, ms));
