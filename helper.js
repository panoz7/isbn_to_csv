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

export function downloadFile(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }