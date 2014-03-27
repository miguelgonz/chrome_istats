(function () {
    var refreshRequests = function () {
        $('#content tbody').html('');

        if (bg.data.length === 0) {
            $('#content tbody').html('<tr><td colspan="2">No requests</td></tr>');
        }
        for (var request in bg.data) {
            var label = bg.data[request];
            $('#content tbody').append(
                '<tr><td>'+label.key+'</td><td>'+label.value+'</td></tr>'
                );
        }
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
})();
