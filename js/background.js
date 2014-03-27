console.log('iStats logger loaded');
var dataListener = function () {};

var data = [];

function clear () {
    data = [];
}

function updateBadge() {
    chrome.browserAction.setBadgeText ( { text: data.length.toString() } );
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
                        data.unshift({'key':key, 'value':params[key]});
                    }
                }
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
