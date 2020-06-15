"use strict";

class JWT {

    //base64URL to JSON
    static decodeBase64(base64Url){

        let json;
        try {
            //Convert base 64 url to base 64
            const base64 = base64Url.replace('-', '+').replace('_', '/');
            const utf8 = atob(base64);
            json = JSON.parse(utf8);
        } catch (err) {
            json = "Bad Section.\nError: " + err.message
        }
        return json;
    }

    //output JSON object with header, payload, signature attributes as well as an extra message attribute for info only
    static decodeJwt(jwt) {

        let header, payload, signature, message;

        const parts = jwt.split(".")
        if (parts.length == 3) {
            message = "JWT parsed successfully";
            header = this.decodeBase64(parts[0])
            payload = this.decodeBase64(parts[1])
            if (parts[2].length > 0) {
                signature = parts[2];
            } else {
                signature = "[Unsigned Token]";
            }
        } else {
            message = "A JWT must have 3 sections.";
            header = "";
            payload = "";
            signature = "";
        }

        const jwt_json = {
            header: header,
            payload: payload,
            signature: signature,
            message: message
        };

        return jwt_json;
    }

    static parse_display(e) {
        const input    = document.getElementById("input");
        const pre_json = document.getElementById("json");
        let jwt_json = this.decodeJwt(input.value);
        //make some attributes human readable
        jwt_json = this.humanize(jwt_json);
        //display JSON string
        pre_json.textContent = JSON.stringify(jwt_json, null, 4);  
    } 

    //string to arraybuffer
    static str2ab(str) {
        var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (var i=0, strLen=str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
        }
        return buf;
      }

    static humanize(json) {
        let epoch, date;
        if (json.payload.iat) {
            epoch = json.payload.iat;
            date = new Date(epoch * 1000);
            json.payload.iat = `${epoch} (${date.toLocaleString()})`;
        }

        if (json.payload.nbf) {
            epoch = json.payload.nbf;
            date = new Date(epoch * 1000);
            json.payload.nbf = `${epoch} (${date.toLocaleString()})`;
        }

        if (json.payload.exp) {
            epoch  = json.payload.exp;
            date = new Date(epoch * 1000);
            json.payload.exp = `${epoch} (${date.toLocaleString()})`;
        }

        return json;
    }

    //get query string value of a given key
    static getQueryString(key){
        const urlParams = new URLSearchParams(window.location.search);
        if(urlParams.has(key)) {
            return urlParams.get(key);
        } else {
            return null;
        }
    }

    //get query string named jwt, if there, parse and display
    static getJwtFromQueryString() {
        const jwt = this.getQueryString("jwt");
        if (jwt) {
            const input = document.getElementById("input");
            input.value = jwt;
            this.parse_display(null);
        }
    }
}

window.onload = () => {
    const input = document.getElementById("input");
    input.addEventListener("input", e => {JWT.parse_display(e);});
    //in case there is query string "jwt"
    JWT.getJwtFromQueryString();
}