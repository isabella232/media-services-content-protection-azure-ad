"use strict";

class INFO {

   //get query string value of a given key
   static getQueryString(key) {
        const urlParams = new URLSearchParams(window.location.search);
        if(urlParams.has(key)) {
            return urlParams.get(key);
        } else {
            return null;
        }
    }

    //display content based on query string
    static displayContent() {
        const topic = this.getQueryString("topic");
        const div_content = document.getElementById("content");
        let html = "";
        const scope_list = SCOPE_CONST.SCOPE_LIST;
        switch (topic) {
            case "scope":
                scope_list.forEach((item, index) => {
                    html += `<h4>${item.name}</h4>`;
                    item.scopes.forEach((scope, idx) => {
                        html += `<div> &emsp; ${scope} </div>`;
                    })
                })
                break;
            default:
        }

        div_content.innerHTML = html;
    }

}

window.onload = () => {
    INFO.displayContent();
}