"use strict";

class AMS {

    static get formats() {
        return [
            "Widevine+DASH+CSF",
            "Widevine+DASH+CMAF",
            "Widevine+HLS+CMAF",
            "PlayReady+DASH+CSF",
            "PlayReady+DASH+CMAF",
            "PlayReady+HLS+CSF",
            "PlayReady+HLS+CMAF",
            "FairPlay+HLS+TS",
            "FairPlay+HLS+CMAF",
            "AES+DASH+CSF",
            "AES+DASH+CMAF",
            "AES+HLS+TS",
            "AES+HLS+CMAF",
            "Unprotected"
        ]
    }

    //populate AMS UI elements onload
    static populateAmsUi() {
        //populate select options for streaming formats/protectionType
        const select = document.getElementById("protectionType");
        let option;
        const formats = this.formats;
        formats.forEach((item, index) => {
            option = document.createElement("option");
            option.value = item;
            option.innerHTML = item;
            select.appendChild(option);
        })

        //populate default source URL
        document.getElementById("sourceUrl").value = AMS_CONST.DEFAULT_URL;

        //populate App Cert URL
        document.getElementById("appCert").value = AMS_CONST.APP_CERT_URL;
    }

    static play() {
        const select = document.getElementById("protectionType");
        const drm    = select.options[select.selectedIndex].value;
        const status = document.getElementById("status");
        status.innerHTML = `Encryption/protocol/container selected: ${drm}, access_token is required for protected content.`;

        const options = {
            autoplay: true,
            controls: true,
            width: "992",
            height: "560",
            poster: "",
            plugins: this.getPlugins()
        };

        const player = amp("azuremediaplayer", options);

        switch (drm) {
            case "Unprotected":
                player.src([{
                    src: document.getElementById("sourceUrl").value,
                    type: "application/vnd.ms-sstr+xml"
                }]);
                break;
            case "FairPlay+HLS+TS":
            case "FairPlay+HLS+CMAF":
                player.src([{
                    src: document.getElementById("sourceUrl").value,
                    type: "application/vnd.ms-sstr+xml",
                    protectionInfo: [{ 
                        type:                drm.split("+")[0], 
                        authenticationToken: document.getElementById("jwt").value,
                        certificateUrl:      document.getElementById("appCert").value }]
                }]);
                break;
            default:
                player.src([{
                    src: document.getElementById("sourceUrl").value,
                    type: "application/vnd.ms-sstr+xml",
                    protectionInfo: [{ 
                        type: drm.split("+")[0],
                        authenticationToken: document.getElementById("jwt").value
                    }]
                }]);
        }
    }

    static selectDrm() {
        const select         = document.getElementById("protectionType");  
        const status         = document.getElementById("status");
        const sourceUrlInput = document.getElementById("sourceUrl");
        
        const drm = select.options[select.selectedIndex].value;
        let url = sourceUrlInput.value;
        let format_string = "",
            message = "";

        switch (drm) {
            case "Unprotected":
                message = "Make sure the video is not encrypted.";
                break;
            case "Widevine+DASH+CSF":
                format_string = "(format=mpd-time-csf,encryption=cenc)";
                break;
            case "Widevine+DASH+CMAF":
                format_string = "(format=mpd-time-cmaf,encryption=cenc)";
                break;
            case "Widevine+HLS+CMAF":
                format_string = "(format=m3u8-cmaf,encryption=cenc)";
                message = "Not supported by this player. LA_URL override required.";
                break;
            case "PlayReady+DASH+CSF":
                format_string = "(format=mpd-time-csf,encryption=cenc)";
                break;
            case "PlayReady+DASH+CMAF":
                format_string = "(format=mpd-time-cmaf,encryption=cenc)";
                break;
            case "PlayReady+HLS+CSF":
                format_string = "(format=m3u8-aapl,encryption=cenc)";
                message = "Not supported by this player.";
                break;
            case "PlayReady+HLS+CMAF":
                format_string = "(format=m3u8-cmaf,encryption=cenc)";
                message = "Not supported by this player.";
                break;
            case "FairPlay+HLS+TS":
                format_string = "(format=m3u8-aapl,encryption=cbcs-aapl)";
                break;
            case "FairPlay+HLS+CMAF":
                format_string = "(format=m3u8-cmaf,encryption=cbcs-aapl)";
                break;
            case "AES+DASH+CSF":
                format_string = "(format=mpd-time-csf,encryption=cbc)";
                break;
            case "AES+DASH+CMAF":
                format_string = "(format=mpd-time-cmaf,encryption=cbc)";
                break;
            case "AES+HLS+TS":
                format_string = "(format=m3u8-aapl,encryption=cbc)";
                message = "Not supported by this player.";
                break;
            case "AES+HLS+CMAF":
                format_string = "(format=m3u8-cmaf,encryption=cbc)";
                message = "Not supported by this player.";
                break;
            default:
        }

        status.innerHTML = message;
        //replace format string
        url = this.reviseFormatString(url, format_string);
        //change the sourceUrl to new format string
        sourceUrlInput.value = url;
    }

    //replace the current format string by the input format_string
    static reviseFormatString(url, format_string) {
        const index = url.indexOf("(format");
        url = url.substring(0, index) + format_string;
        return url;
    }

    //get AMP plugin array
    static getPlugins() {
        var plugins = {};

        //for framerate and timescale values in the overlay, this plugin is used. If you do not include this plugin, those 2 values will not be displayed. 
        //frameRateTimecodeCalculator
        plugins.frameRateTimecodeCalculator = {
            default:   30.123,        // Optional: default frame rate value to use if calculation fails; if not provided, the default value is 30
            timeScale: 10000000,      // Optional: default time scale value to use if client manifest parsing fails: if not provided, the default value is 10000000
            dropFrame: true           // Optional: flag to determine whether to use drop frame timecode or not for 29.97fps; if not provided, the default value is false (non-drop frame timecode)
        };

        //diagnoverlay
        plugins.diagnoverlay = {
            title: "",                //overlay title
            x: "left",                //overlay position 
            y: "top",
            opacity: 0.6,             //overlay background opacity
            bgColor: "Black",         //overlay background color
            image: "img/AMSLogo.png"  //image URL. Skip it if do not need image
        }

        return plugins;
    }

}


class ACUtils { 

    static Uint8Array2String(uint8Array) {
        let str = "";
        for (var i = 0; i < uint8Array.byteLength; i++) {
            str += String.fromCharCode(uint8Array[i]);
        }
        return str;
    }
 
    //use fetch to download App Cert as arrayBuffer, then convert to string
    static getAC() {
        const acPath = document.getElementById("appCert").value;

        if (acPath != undefined && acPath != null && acPath != "") {
            fetch(acPath, {
                method: "GET"
            })
            .then(response => {
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                const certificate = new Uint8Array(arrayBuffer);
                const popup = document.getElementById("PopUpText")
                popup.innerHTML = this.Uint8Array2String(certificate);
                const div = document.getElementById("PopUp");
                div.style.display = "block";
            })
            .catch( error => {
                const popup = document.getElementById("PopUpText")
                popup.innerHTML = error;
                const div = document.getElementById("PopUp");
                div.style.display = "block";
            })
        }
        else {
            const popup = document.getElementById("PopUpText")
            popup.innerHTML = "AC path needs to be specified.";
            const div = document.getElementById("PopUp");
            div.style.display = "block";
        }
    }

}
