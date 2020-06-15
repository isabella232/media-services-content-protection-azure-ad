"use strict";

//*************************************************************
// JWT ********************************************************
//get full authorization URL
const get_authorization_url = () => {
    var url = "https://login.microsoftonline.com/";
    url += document.getElementById("tenant").value + "/oauth2/v2.0/authorize";
    url += "?client_id="     + document.getElementById("client_id").value;
    url += "&response_type=" + document.getElementById("response_type").value;
    url += "&redirect_uri="  + document.getElementById("redirect_uri").value;
    url += "&response_mode=" + document.getElementById("response_mode").value;
    url += "&scope="         + encodeURIComponent(document.getElementById("scope").value);
    url += "&state="         + "12345";

    return url;
}

//authorize sync with full authorization URL
const authorize_redirect = () => {
    var url = get_authorization_url();
    window.location.href = url;
}

//after successful login, the page closes itself, hence this option does not give you a chance to capture the authorization_code and the URL
const authorize_popup = () => {
    var url = get_authorization_url();

    var windowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,satus=yes";
    var windowObject = window.open(url, "Authorization Code Grant Flow", windowFeatures);
}

const toggleVisibility = (div_id) => {
  const divs = ["div_oauth20", "div_api", "div_test", "div_image", "div_ams"];
  let div_tag;

  //show the selected and hide the rest
  for (var i = 0; i < divs.length; i++) {
    div_tag = document.getElementById(divs[i]);

    if (divs[i] === div_id) {
      div_tag.style.display = "block";
    } else {
      div_tag.style.display = "none";
    }
  }

}


  //populate login module UI: MSAL settings
  MsalSettingsManager.populateMsalSettings();

  //use actual URL string instead of javascript code so that developer can copy the full URL
  document.getElementById("get_authorization_code").href = get_authorization_url();
  //by default show JWT page/login page.
  toggleVisibility("div_oauth20");
  


//*************************************************************
// API ********************************************************

//populate API select options
const populateApiSelectOptions = () => {
  const select = document.getElementById("api");
  let option;
  for(const key in API_CONST.API_LIST){
    option = document.createElement("option");
    option.value = key;
    option.innerHTML = API_CONST.API_LIST[key].display;
    select.appendChild(option);
  }
}

//use JavaScript ES6’s crypto API to generate GUID/UUID at the client side
const guid = () => {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

//get HTTP body with dynamically generated attribute values
const getBody = (purpose) => {
  var body;

  switch (purpose) {
      case "create":
        body = {
          nodeId: guid(),
          nodeName: "Grass Valley test node 06",
          nodeType: "hublet",
          nodeDescription: "testing schema v1",
          nodeStatus: "test status - complete",
          nodeMetadata: "certain types of node_metadata, but not arbitrary",
          customMetadata: {
              vendor: "Grass Valley",
              product: "SoftServe v 8.1",
              quantity: 111,
              volume: 111
            },
          nodeTags: {
              tag0: "tag value 00",
              tag1: "tag value 01"
            },
          createdOn: (new Date()).toISOString(),
          updatedOn: (new Date()).toISOString()
        };
        break;
     case "update":
       body = {
         instruction: "Replace me by the body of the node you want to update. And put nodeId in URL."
       }
       break;
     default:
  }

  return body;
}

//based on user dropdown selection, set REST API: URL, method, body
const selectApi = () => {
  //get selected option
  const select = document.getElementById("api");
  const testCase= select.options[select.selectedIndex].value;
  let body = "";

  //overwrite body attribute dynamically to generate GUID and time values
  switch (testCase) {
    case "create":
      body = getBody("create");
      break;
    case "update":
      body = getBody("update");
      break;
    case "ams_drm":
      //switch to AMS tab for testing license delivery API
      toggleVisibility("div_ams");
      break;
    default:
  }

  if (testCase === "method") {   //not a test case, clear UI
    document.getElementById("api_method").innerHTML = "";
    document.getElementById("api_url").value = "";
    document.getElementById("json").innerHTML = "";
    document.getElementById("api_body").value = "";
    document.getElementById("api_info").innerHTML = "";
    document.getElementById("correlation_id").innerHTML = "";
  } else {
    //get selected API details: URL (format), method, body
    document.getElementById("api_method").innerHTML = API_CONST.API_LIST[testCase].method;
    document.getElementById("api_url").value        = API_CONST.API_LIST[testCase].url;
    document.getElementById("api_body").value       = JSON.stringify(body, undefined, 4);
    document.getElementById("api_info").innerHTML   = API_CONST.API_LIST[testCase].info;
  }
}

const call_api = () => {
  let headers;
  let options;

  //input check
  const url = document.getElementById("api_url").value;
  
  if (msalCache.access_token == undefined || msalCache.access_token == null){
    window.alert("Must acquire access_token thru login before test.");
    return
  }
  if (url == undefined || url.length === 0) {
    window.alert("An API call must be selected to test.");
    return;
  }

  //prepare REST call
  const httpMethod = document.getElementById("api_method").innerHTML;
  const bearer     = "Bearer " + msalCache.access_token;

  let body;

  try{
    body = JSON.stringify(JSON.parse(document.getElementById("api_body").value));
  } catch (error){
    document.getElementById("json").innerHTML = JSON.stringify({"error": "JSON format error in input body"}, undefined, 4);
    return;
  }

  //adding x-correlation-id emulating upstream call having a x-correlation-id header
  //this requires adding x-correlation-id into <allowd_headers> in APIM inbound policy
  const x_correlation_id = guid();
  headers = new Headers();
  headers.append("Authorization", bearer);
  headers.append("Content-Type", "application/json");
  headers.append("x-correlation-id", x_correlation_id);

  if (httpMethod === "POST" || httpMethod === "PUT") {
    options = {
            method:  httpMethod,
            headers: headers,
            body:    body,
    };
  } else {
    options = {
      method: httpMethod,
      headers: headers,
    };
  }

  let confirmResponse;
  if(httpMethod === "DELETE"){
    confirmResponse = confirm("Are you sure you want to delete this node?");
    if (confirmResponse !== true) {
      return;
    }
  }

  if (httpMethod === "PUT") {
    confirmResponse = confirm("Are you sure you want to update this node?");
    if (confirmResponse !== true) {
      return;
    }
  }

  //preflight in coordination with inbound/outbound policy of API Management
  fetch(url, options)
    .then(response => {
      //retrieve and display correlation IDs
      handleCorrelationIds(response, x_correlation_id);
      //return JSON body promise
      return response.json();
    })
    .then(data => {
      
      //modify node.customMetadata.logo, if any.
      const select = document.getElementById("api");
      const testCase= select.options[select.selectedIndex].value;
      
      switch (testCase) {
        case "get":
        case "update":
          data = modifyNode(data);
          break;
        case "list":
        case "query":
          for (var i = 0; i < data.length; i++){
            data[i] = modifyNode(data[i]);
          }
          break;
        default:
      }

      //disply data with modified customMetadata.logo, if exist
      let display;
      //certain response may not be JSON
      try {  
        display = JSON.stringify(data, undefined, 4);
      }
      catch (error) {
        display = error;
      }
      document.getElementById("json").innerHTML = display;
    })
    .catch(err =>{
      console.log("fetch error: ", err);
    });
}

//handle correlation IDs
const handleCorrelationIds = (response, x_correlation_id) => {

  const HEADER_CORRELATION_ID    = "x-hv-request-id",
        HEADER_REQUEST_ID        = "request-id",      //Graph API uses both request-id and client-request-id in response, with same value
        HEADER_CLIENT_REQUEST_ID = "client-request-id";

  //retrieve and display correlationId and x_correlation_id
  //first try x-hv-request-id
  let correlation_id = response.headers.get(HEADER_CORRELATION_ID);
  //Graph API returns request-id and client-request-id
  if (!correlation_id){
    correlation_id = response.headers.get(HEADER_CLIENT_REQUEST_ID);
  }
  if (!correlation_id) {
    correlation_id = response.headers.get(HEADER_REQUEST_ID);
  }
  document.getElementById(  "correlation_id").innerHTML =   correlation_id;
  document.getElementById("x_correlation_id").innerHTML = x_correlation_id;
}

//modify node.customMetadata.logo, if exist, to display popup image
const modifyNode = (node) => {
  if (node.customMetadata && node.customMetadata.logo){ 
    const image_base64 = node.customMetadata.logo; 

    //modify customMetadata.logo for hover popup
    const modified_customMetadata_logo = 
    "<a class='hoverable'>" + image_base64 
    + "</a><div class='show-on-hover'><img src='" + image_base64 
    + "' alt='customMetadata.logo' /></div>";

    node.customMetadata.logo = modified_customMetadata_logo;
  }
    
  return node;
}

//encode an image file from local disk to URL
const encodeImageFileAsURL = (element) => {
  const file = element.files[0];
  const reader = new FileReader();
  reader.onloadend = function() {
    const base64_url = reader.result;
    document.getElementById("image_base64" ).innerHTML =  base64_url;
    document.getElementById("image_display").innerHTML = "<img src='" + base64_url + "' alt='' />";
  }
  reader.readAsDataURL(file);
}