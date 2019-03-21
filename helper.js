export function makeHttpRequest(url,method,body,contentType = 'application/x-www-form-urlencoded') {

    return new Promise((resolve, reject) => {

        var req = new XMLHttpRequest();
        req.open(method, url);

        req.setRequestHeader('Content-type', contentType);

        req.onload = function() {
            if (req.status == 200)
                resolve(req.response)
            else
                reject(Error(req.statusText));
        }

        // Handle network errors
        req.onerror = function() {
            reject(Error("Network Error"));
        };

        // Make the request
        req.send(body);

    })
}