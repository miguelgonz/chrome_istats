var dataListener = function () {},
    data = [],
    defaultConfig = { whitelist: '', whitelist_label: '', whitelist_value: '', blacklist_label: '', blacklist_value: '', enabled: 1, alphabetically_checkbox: ''},
    config = defaultConfig;

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
    chrome.storage.local.get(defaultConfig, function(storedConfig) {
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

/**
 * Returns if the request should pass
 */
function _filterRequest(params) {
    var key;
    //decide if we have to filter the request or not
    if (config.whitelist_label !== '') {
        for (key in params) {
            if (key === config.whitelist_label && params[key] === config.whitelist_value) {
                return true;
            }
        }
        return false;
    }
    if (config.blacklist_label !== '') {
        for (key in params) {
            console.log(key, params[key]);
            if (key === config.blacklist_label && params[key] === config.blacklist_value) {
                return false;
            }
        }
        return true;
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

            if (_filterRequest(params)) {
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
