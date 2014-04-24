//option key, DOM VALUE
var optionMapping = {
    'whitelist': 'whitelist',
    'blacklist_label': 'blacklist_label',
    'blacklist_value': 'blacklist_value',
    'whitelist_label': 'whitelist_label',
    'whitelist_value': 'whitelist_value'
};

var removeSpaces = function(text) {
    return text.replace(/ /g, '');
};

// Saves options to chrome.storage
function save_options() {
    var setOptions = {};
    for (var key in optionMapping) {
        setOptions[key] = $('#'+optionMapping[key]).val();
    }

    chrome.storage.local.set(setOptions, function() {
        // Update status to let user know options were saved.
        var status = $('#status').hide();
        status.text('Options saved.').fadeIn();
        setTimeout(function() {
            status.fadeOut();
        }, 750);
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
        for (var key in optionMapping) {
            $('#'+optionMapping[key]).val(items[key]);
        }
    });
}
$(function () {
    restore_options();
    $('#save').click(save_options);
});
