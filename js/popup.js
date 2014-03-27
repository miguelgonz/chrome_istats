
var refreshRequests = function () {
    for (var request in bg.data) {
        var label = bg.data[request];
        $('#content tbody').append(
            '<tr><td>'+label.key+'</td><td>'+label.value+'</td></tr>');
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
