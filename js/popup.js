
var refreshRequests = function () {

    //TODO sync once in a while
    chrome.storage.sync.get({ whitelist: '' }, function(config) {
        var whitelist = false;
        if (config.whitelist !== '') {
            whitelist = config.whitelist.split(',');
        }

        for (var request in bg.data) {
            var label = bg.data[request];
            if (!whitelist || whitelist.indexOf(label.key) !== -1) {
                $('#content tbody').append(
                    '<tr><td>'+label.key+'</td><td>'+label.value+'</td></tr>'
                );
            }
        }
    });
};


var bg;

jQuery(function () {
    bg = chrome.extension.getBackgroundPage();
    bg.addDataListener(refreshRequests);
    refreshRequests();
    $('#clear').click(function () {
        bg.clear();
        refreshRequests();
    });
});
