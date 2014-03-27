console.log('iStats logger loaded');
var dataListener = function () {};

var data = [];

function clear () {
    data = [];
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
      var urlParts = info.url.split("?");
      if (urlParts.length > 1) {
          var params = parseQueryString(urlParts[1]);
          for (var key in params) {
              console.log(key);
              if ( key === 'prev_page_type' ||
                   key === 'page_type'
              ) {
                  data.push({'key':key, 'value':params[key]});
              }
          }
          console.log(data);
          dataListener();
      }
  },
  { //filter
    urls: [ "http://sa.bbc.co.uk/*" ]
  },
  // extraInfoSpec
  ["blocking"]
);
