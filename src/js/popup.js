(function () {

    var cache, options, bg,
    defaultConfig = { whitelist: '', whitelist_label: '', whitelist_value: '', blacklist_label: '', blacklist_value: '', enabled: 1, alphabetically_checkbox: '', highlightpageviews_checkbox: '' };

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

    function highlightPageviews(data) {
        return data;
    }

    function refreshRequests() {
        $('#content').html('');

        var sortByKey = function (a, b) {
            return a.key > b.key ? '1':'-1';
        };

        try {
            if (bg.data.length === 0) {
                cache.content.hide();
                cache.clear.hide();
                cache.message.show().html('No requests recorded yet');
            } else {
                cache.content.show();
                cache.clear.show();
                cache.message.hide().html('');
            }
        }catch(e) {
            console.error(e);
        }
        for (var requestIndex in bg.data) {
            var request = bg.data[requestIndex];

            if (request.labels.length === 0) {
                continue;
            }

            var tableClass = "";
            if (options.highlightpageviews_checkbox === 'on') {
                if (request.labels.ns_type === 'hidden') {
                    tableClass = " downlighted";
                } else {
                    tableClass = " highlighted";
                }
            }

            var labels = [];
            for (var key in request.labels) {
                labels.push({'key': key, 'label': request.labels[key]});
            }
            if (labels.length === 0) {
                return;
            }

            html = '<h4><span class="glyphicon glyphicon-time glyphicon"></span> ' + formatHour(new Date(request.timestamp)) + '</h4>' +
                '<table class="request table table-striped' + tableClass + '"><thead> <tr><th>Key</th><th>Value</th></tr> </thead>';

            if (options.alphabetically_checkbox === 'on') {
               labels = labels.sort(sortByKey); 
            }
            for (var i in labels) {
                html += '<tr><td class="key" title="'+labels[i].label +'"><div>'+labels[i].key+'</div></td><td class="value"><div>' + labels[i].label + '</div></td></tr>';
            }

            html += "</table>";

            $('#content').append(html);
        }
    }

    function init() {
        cache = {
            message: $('.message').hide(),
            clear: $('#clear'),
            content: $('#content')
        };

        bg = chrome.extension.getBackgroundPage();
        bg.addDataListener(refreshRequests);

        refreshRequests();
        $('#clear').click(function () {
            bg.clear();
        });
        $('#options').click(function () {
            chrome.tabs.create({'url': chrome.extension.getURL("options.html") });
        });

        $("[name='onoff']")
            .bootstrapSwitch()
            .on('switchChange.bootstrapSwitch', function(event, isEnabled) {
                if (!!isEnabled) {
                    bg.enable();
                } else {
                    bg.disable();
                }
            });
    }

    chrome.storage.local.get(defaultConfig, function(items) {
        options = items;
        jQuery(function () {
            init();
        });
    });

})();
