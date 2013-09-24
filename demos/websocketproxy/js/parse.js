$(function() {
    var ws = new WebSocket("ws://localhost:8004");
    var items = Array();
    ws.onmessage = function(evt) {
        var d = $.parseJSON(evt.data);
        var item_key = new String(d['key']);
        var item_key_id = item_key.replace(/\./g, "");
        if (items.indexOf(item_key) == -1) {
            items.push(item_key)
            $('#placeholder').append("<div id=\"" + item_key_id + "\"></div>")
        }
        $('#' + item_key_id).JSONView(d)
    }
    ws.onopen = function(evt) {
        $('#conn_status').html('<b>Connected</b>');
    }
    ws.onerror = function(evt) {
        $('#conn_status').html('<b>Error</b>');
    }
    ws.onclose = function(evt) {
        $('#conn_status').html('<b>Closed</b>');
    }
});

