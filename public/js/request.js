const request = {
    get: function (url, cbFn) {
        const xhr = request.createXHR(cbFn);

        xhr.open("GET", url);
        xhr.send();
    },

    post: function (url, body, cbFn) {
        const xhr = request.createXHR(cbFn);

        xhr.open("POST", url);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(JSON.stringify(body));
    },

    delete: function (url, cbFn) {
        const xhr = request.createXHR(cbFn);

        xhr.open("DELETE", url);
        xhr.send();
    },

    createXHR: function (cbFn) {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) cbFn(this.responseText);
        };

        return xhr;
    },
};

export { request };
