//option key, DOM VALUE
var optionMapping = {
    'path': 'path',
    'whitelist': 'whitelist',
    'blacklist_label': 'blacklist_label',
    'blacklist_value': 'blacklist_value',
    'whitelist_label': 'whitelist_label',
    'whitelist_value': 'whitelist_value',
    'alphabetically_checkbox': 'alphabetically_checkbox',
    'highlightpageviews_checkbox': 'highlightpageviews_checkbox'
};

var cache = {
    'status': $('#status').addClass('upwards')
};

var removeSpaces = function(text) {
    return text.replace(/ /g, '');
};

// Saves options to chrome.storage
function save_options() {
    var setOptions = {}, el;
    for (var key in optionMapping) {
        el = $('#'+optionMapping[key]);
        if (el.attr('type') === 'checkbox') {
            setOptions[key] = $('#'+optionMapping[key]).is(':checked') ? 'on':'';
        } else {
            setOptions[key] = $('#'+optionMapping[key]).val();
        }
    }

    chrome.storage.local.set(setOptions, function() {
        // Update status to let user know options were saved.
        cache.status.text('Options saved').removeClass('upwards');
        setTimeout(function() {
            cache.status.addClass('upwards');
        }, 2000);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

    var defaultOptions = {};
    for (var key in optionMapping) {
        defaultOptions[key] = '';
    }

    chrome.storage.local.get(defaultOptions, function(items) {
        var el;
        for (var key in optionMapping) {
            el = $('#'+optionMapping[key]);
            if (el.attr('type') === 'checkbox') {
                if (items[key] === 'on') {
                    el.attr('checked', 'checked');
                }
            } else {
                el.val(items[key]);
            }
        }
    });
}
$(function () {
    restore_options();
    $('input').keydown(function (e) {
        if (e.keyCode === 13 || e.keyCode === 32) {
            save_options();
        }
    });
    $('#save').click(save_options);
    $('input').blur(save_options);
});
