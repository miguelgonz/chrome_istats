(function () {

    function formatHour(date) {
        var hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds();
        
        return  hours + ":" + 
                ((minutes < 10) ? "0" : "") + minutes + ":" + 
                ((seconds < 10) ? "0" : "") + seconds;
    }

    var refreshRequests = function () {
        $('#content tbody').html('');

        if (bg.data.length === 0) {
            $('#content,#clear').hide();
            $('.message').show().html('No requests');
        } else {
            $('#content,#clear').show();
            $('#message').hide();
        }
        for (var request in bg.data) {
            var label = bg.data[request];
            html = '<tr><td>'+label.key+'</td><td>'+label.value+'</td></tr>';
            if (label.separator) {
                html = '<tr class="request-header"><td colspan="2">' +
                    formatHour(new Date(label.timestamp)) +
                    '</td></tr>';
            }
            $('#content tbody').append(html);
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
