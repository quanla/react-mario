const {O} = require("../../utils/object-util");

const ApiFactory = {
    createApi({ headers, beforeSend, onError, urlModifier = (url) => url, rawUrlMod = (url) => url}) {

        function beforeSend1(request) {
            O.forEach(headers, (valueF, key)=> {
                let value = valueF();
                if (value ) {
                    request.setRequestHeader(key, value);
                }
            });
            beforeSend && beforeSend(request);
        }

        const xhrWithPayload = (method) =>
            (url, payload, options) => new Promise((resolve, reject)=>{
                $.ajax({
                    url: urlModifier("/api" + url),
                    data: JSON.stringify(payload),
                    beforeSend: beforeSend1,
                    method: method,
                    contentType: "application/json",
                    headers: options ? {"Requesting-Url": window.location.href, ...options.headers} : {"Requesting-Url": window.location.href},
                    success: (data)=>{
                        resolve(data);
                    },
                    error: (resp, status, error) => {
                        reject(resp.responseJSON);
                    }
                });
            })
        ;

        const xhrWithoutPayload = (method) =>
            (url, options) => new Promise((resolve, reject) => {
                $.ajax({
                    url: urlModifier("/api" + url),
                    method: method,
                    beforeSend: beforeSend1,
                    contentType: "application/json",
                    headers: options ? {"Requesting-Url": window.location.href, ...options.headers} : {"Requesting-Url": window.location.href},
                    success: (data, status, resp) => {
                        if (options && options.keepHttpResp) {
                            resolve({
                                responseJSON: resp.responseJSON,
                                getResponseHeader: resp.getResponseHeader
                            });
                        } else {
                            resolve(data);
                        }
                    },
                    error: (resp, status, error) => {
                        reject(resp.responseJSON);
                        onError && onError(resp);
                    }
                });
            })
        ;

        return {
            get: xhrWithoutPayload("GET"),
            delete: xhrWithoutPayload("DELETE"),
            deleteWithPayload: xhrWithPayload("DELETE"),
            post: xhrWithPayload("POST"),
            put: xhrWithPayload("PUT"),
            postMultipart: (url, data) => {
                let formData = new FormData();
                O.forEach(data, (value, key)=>{
                    if (value != null) {
                        formData.append(key, value);
                    }
                });

                return new Promise((resolve, reject)=>{
                    $.ajax({
                        url: urlModifier("/api" + url),
                        type: 'POST',
                        beforeSend: beforeSend1,
                        data: formData,
                        cache: false,
                        dataType: 'json',
                        processData: false, // Don't process the files
                        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                        success: (data) => {
                            resolve(data);
                        },
                        error: (resp, status, error) => {
                            reject(error);
                        }
                    });
                });
            },

            postForm: (url, data, options) => new Promise((resolve, reject)=>{
                $.ajax({
                    url: urlModifier("/api" + url),
                    data: data,
                    beforeSend: beforeSend1,
                    method: "POST",
                    success: (data, status, resp)=>{
                        if (options && options.keepHttpResp) {
                            resolve({
                                responseJSON: resp.responseJSON,
                                getResponseHeader: resp.getResponseHeader
                            });
                        } else {
                            resolve(data);
                        }
                    },
                    error: (resp, status, error)=>{
                        reject(resp.responseJSON);
                    }
                });
            }),
            downloadStream(url) {
                window.open(rawUrlMod(urlModifier("/api" + url)));
            },
        };
    }
};

exports.ApiFactory = ApiFactory;