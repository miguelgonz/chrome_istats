(function () {

    var options, bg,
        defaultConfig = { whitelist: '', whitelist_label: '', whitelist_value: '', blacklist_label: '', blacklist_value: '', enabled: 1, alphabetically_checkbox: ''};

    function formatHour(date) {
        var hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds();
        
        return  hours + ":" + 
                ((minutes < 10) ? "0" : "") + minutes + ":" + 
                ((seconds < 10) ? "0" : "") + seconds;
    }

    function sortAlphabetically(lines) {
        var out = [], tmp = [];
        var sortByKey = function (a, b) {
            return a.key > b.key ? '1':'-1';
        };
        for (var i in lines) {
            var line = lines[i];
            if (line.separator) {
                if (tmp.length > 0) {
                    out = out.concat(tmp.sort(sortByKey));
                    tmp = [];
                }
                out.push(line);
            } else {
                tmp.push(line);
            }
        }
        return out;
    }

    var refreshRequests = function () {
        $('#content tbody').html('');

        try {
            if (bg.data.length === 0) {
                $('#content').hide();
                $('#clear').hide();
                $('.message').show().html('No requests');
            } else {
                $('#content').show();
                $('#clear').show();
                $('#message').hide().html('');
            }
        }catch(e) {
            console.error(e);
        }
        var data = bg.data;
        if (options.alphabetically_checkbox === 'on') {
           data = sortAlphabetically(data); 
        }
        for (var request in data) {
            var label = data[request];
            html = '<tr><td>'+label.key+'</td><td>'+label.value+'</td></tr>';
            if (label.separator) {
                html = '<tr class="request-header"><td colspan="2">' +
                    formatHour(new Date(label.timestamp)) +
                    '</td></tr>';
            }
            $('#content tbody').append(html);
        }
    };

    function init() {
        bg = chrome.extension.getBackgroundPage();
        bg.addDataListener(refreshRequests);

        refreshRequests();
        $('#clear').click(function () {
            bg.clear();
            refreshRequests();
        });
        $('#onoff').click(function () {
            if ($(this).text() === 'Enabled') {
                $(this).text('Disabled');
                bg.disable();
            } else {
                $(this).text('Enabled');
                bg.enable();
            }
        }).text(bg.config.enabled ? 'Enabled':'Disabled');
    }

    chrome.storage.local.get(defaultConfig, function(items) {
        options = items;
        jQuery(function () {
            init();
        });
    });

})();
