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


var refreshRequests = function () {
    for (var request in bg.data) {
        var params = parseQueryString(bg.data[request].url);
        for (var param in params) {
            $('#content').append('<tr><td>'+param+'</td><td>'+params[param]+'</td></tr>');
        }
    }
};

var bg;

jQuery(function () {
    bg = chrome.extension.getBackgroundPage();
    bg.addDataListener(refreshRequests);
    refreshRequests();
    $('#clear').click(function () {
        bg.clear();
    });
});
