console.log('iStats logger loaded');
var dataListener = function () {};

var data = [];

function clear () {
    data = [];
}

function addDataListener (callback) {
    dataListener = callback;
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(info) {
      data.push(info);
      dataListener();
  },
  { //filter
    urls: [ "http://sa.bbc.co.uk/*" ]
  },
  // extraInfoSpec
  ["blocking"]
);
