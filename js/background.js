console.log('iStats logger loaded');
var dataListener = function () {};

var data = [];

function clear () {
    data = [];
    updateBadge();
}

function updateBadge() {
    var numberRequests = 0;
    for (var i=0; i < data.length ; i++) {
        if (data[i].separator) {
            numberRequests ++;
        }
    }
    chrome.browserAction.setBadgeText ( { text: numberRequests.toString() } );
}

var parseQueryString = function( queryString ) {
    var params = {}, queries, temp, i, l;
    // Split into key/value pairs
    queries = queryString.split("&");
    // Convert the array of strings into an object
    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
};

function addDataListener (callback) {
    dataListener = callback;
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {

        chrome.storage.sync.get({ whitelist: '' }, function(config) {
            var whitelist = false;
            if (config.whitelist !== '') {
                whitelist = config.whitelist.split(',');
            }

            var urlParts = info.url.split("?");

            if (urlParts.length > 1) {
                var params = parseQueryString(urlParts[1]);
                for (var key in params) {
                    if (!whitelist || whitelist.indexOf(key) !== -1) {
                        data.unshift({'separator': false, 'key':key, 'value':params[key]});
                    }
                }
                data.unshift({'separator':true, 'timestamp': new Date().getTime()});
                dataListener();
                updateBadge();
            }

        });
    },
    { //filter
        urls: [ "http://sa.bbc.co.uk/*" ]
    },
    // extraInfoSpec
    ["blocking"]
);
