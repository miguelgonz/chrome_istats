var dataListener = function () {},
    data = [],
    config = { whitelist: '', filter_key: '', filter_value: '', enabled: 1};

function init() {
    chrome.storage.onChanged.addListener(_loadSettings);
    _loadSettings();
    console.log('iStats logger loaded');
}

function clear () {
    data = [];
    _updateBadge();
}

function enable() {
    config.enabled = true;
    chrome.browserAction.setIcon({ "path": "img/logo.png" });
    _updateConfig();
}

function disable() {
    config.enabled = false;
    chrome.browserAction.setIcon({ "path": "img/logo_off.png" });
    _updateConfig();
}

function addDataListener (callback) {
    dataListener = callback;
}

/** Not public facing functions */

function _loadSettings() {
    chrome.storage.local.get({ whitelist: '', filter_key: '', filter_value: '' , enabled: 1}, function(storedConfig) {
        config = storedConfig;
    });
}

function _updateConfig() {
    chrome.storage.local.set({'enabled': config.enabled});
}


function _updateBadge() {
    var numberRequests = 0;
    for (var i=0; i < data.length ; i++) {
        if (data[i].separator) {
            numberRequests ++;
        }
    }
    chrome.browserAction.setBadgeText ( { text: numberRequests.toString() } );
}

function _parseQueryString( queryString ) {
    var params = {}, queries, temp, i, l;
    // Split into key/value pairs
    queries = queryString.split("&");
    // Convert the array of strings into an object
    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
}

function _filterRequest(params, config) {
    var key;
    //decide if we have to filter the request or not
    if (config.filter_key !== '') {
        for (key in params) {
            if (key === config.filter_key && params[key] === config.filter_value) {
                return true;
            }
        }
        return false;
    }
    return true;
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {
        var whitelist = false,
            count = 0,
            urlParts = info.url.split("?"),
            params = false;
        if (!config.enabled) return;

        if (urlParts.length > 1) {
            params = _parseQueryString(urlParts[1]);
            if (config.whitelist !== '') {
                whitelist = config.whitelist.split(',');
            }

            if (_filterRequest(params, config) !== false) {
                for (var key in params) {
                    if (!whitelist || whitelist.indexOf(key) !== -1) {
                        data.unshift({'separator': false, 'key':key, 'value':params[key]});
                        count ++;
                    }
                }
                if (count > 0) {
                    data.unshift({'separator':true, 'timestamp': new Date().getTime()});
                }
                try{
                    dataListener();
                } catch(e) {}
            }
            _updateBadge();
        }
    },
    { //filter
        urls: [ "http://sa.bbc.co.uk/*" ]
    },
    // extraInfoSpec
    ["blocking"]
);


init();
