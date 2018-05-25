global.webSocket = WS.connect("ws://gps-tracker.local:8081");
global.WSSession = null;

webSocket.on("socket/connect", function (session) {
    WSSession = session;

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

webSocket.on("socket/disconnect", function (error) {
    WSSession = null;

    console.log("Disconnected for " + error.reason + " with code " + error.code);

    notify("Web socket not connected", 'error');
});
``