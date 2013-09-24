$(function() {
    var ws = new WebSocket("ws://localhost:8004");
    var items = Array();
    ws.onmessage = function(evt) {
        var d = $.parseJSON(evt.data);
        var item_key = d['key'];
        if (items.indexOf(item_key) == -1) {
            items.push(item_key)
            $('#placeholder').append("<div id=\"" + item_key + "\"></div>")
        }
        $('#' + item_key).JSONView(d)
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

