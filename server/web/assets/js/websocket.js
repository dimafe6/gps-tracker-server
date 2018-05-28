global.ws = WS.connect("ws://gps-tracker.local:8081");
global.wssession = null;

var AUTH = 'a1436b98817c426ea91740829e164a3f';

global.blynk = new Blynk.Blynk(AUTH);

blynk.on('connect', function() { console.log("Blynk ready."); });
blynk.on('disconnect', function() { console.log("DISCONNECT"); });

var terminal = new blynk.WidgetTerminal(1);
terminal.on('write', function(data) {
    wssession.publish("device", {msg: data.toString()});
});

ws.on("socket/connect", function (session) {
    wssession = session;

    notify("Web socket successfully Connected!", 'success');

    session.subscribe("device", function (uri, payload) {
        var json = JSON.parse(payload);
        console.log("Device: ", json);
    });

    session.subscribe("client", function (uri, payload) {
        console.log("Client: ", payload.msg);
    });

    session.publish("device", {msg: "This is a message!"});
});

ws.on("socket/disconnect", function (error) {
    wssession = null;

    console.log("Disconnected for " + error.reason + " with code " + error.code);

    notify("Web socket not connected", 'error');
});
