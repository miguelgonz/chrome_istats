var dataListener = function () {},
    data = [],
    listenUrl = "*://sa.bbc.co.uk/",
    defaultConfig = {
        path: '*',
        whitelist: '',
        whitelist_label: '',
        whitelist_value: '',
        blacklist_label: '',
        blacklist_value: '',
        enabled: 1,
        alphabetically_checkbox: ''
    },
    config = defaultConfig;


function init() {
    setupPopupPanel();
    chrome.storage.onChanged.addListener(_loadSettings);
    _loadSettings();
}

function clear () {
    data = [];
    _updateBadge();
    dataListener();
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

function _loadSettings(cb) {
    chrome.storage.local.get(defaultConfig, function(storedConfig) {
        config = storedConfig;
        if (typeof cb === 'function') {
            cb();
        }
    });
}

function _updateConfig() {
    chrome.storage.local.set({'enabled': config.enabled});
}

var _updatePopup = function () {
    var timer = null;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            dataListener();
        }, 100);
    };
}();

function _updateBadge() {
    var numRequests = data.length;
    chrome.browserAction.setBadgeText ( { text: numRequests.toString() } );
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
            if (key === config.blacklist_label && params[key] === config.blacklist_value) {
                return false;
            }
        }
        return true;
    }
    return true;
}

function setupPopupPanel() {
    var popupId = false;
    function openPopup() {
        _loadSettings(function () {
            chrome.windows.create({
                'url': chrome.extension.getURL('popup.html'),
                'top': 0,
                'left': 0,
                'width': 330,
                'height': 580,
                'type': 'popup'
            }, function (popupWindow) {
                popupId = popupWindow.id;
            });
        });
    }
    //Only have one window opened
    chrome.browserAction.onClicked.addListener(function(tab) {
        if (popupId) {
            chrome.windows.get(popupId, {}, function (theWindow) {
                if (theWindow) {
                    //bring the window to the top
                    chrome.windows.update(popupId, {focused: true});
                }else{
                    openPopup();
                }
            });
        }else{
            openPopup();
        }
    });
}

function isPathAllowed(url) {
    var paths = config.path.split(",");
    for (var i in paths) {
        if (
            paths[i] === '*' ||
            url.indexOf(listenUrl.substring(1) + "bbc/" + paths[i].trim()) !== -1
        ) {
            return true;
        }
    }
    return false;
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {
        var whitelist = false,
            count = 0,
            urlParts = info.url.split("?"),
            params = false,
            requestData = {
                labels: {},
                timestamp: new Date().getTime()
            };

        if (!config.enabled) return;
        //Check that the path is allowed based on the conf
        if (!isPathAllowed(urlParts[0])) return;

        if (urlParts.length > 1) {
            params = _parseQueryString(urlParts[1]);
            if (config.whitelist !== '') {
                whitelist = config.whitelist.split(',');
            }

            if (_filterRequest(params)) {
                for (var key in params) {
                    if (!whitelist || whitelist.indexOf(key) !== -1) {
                        requestData.labels[key] = params[key];
                        count ++;
                    }
                }
                if (count > 0) {
                    data.unshift(requestData);
                }
                _updatePopup();
            }
            _updateBadge();
        }
    },
    { //filter
        urls: [ listenUrl + "*" ]
    },
    // extraInfoSpec
    ["blocking"]
);

init();
