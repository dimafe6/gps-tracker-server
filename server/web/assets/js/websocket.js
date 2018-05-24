global.webSocket = WS.connect("ws://gps-tracker.local:8080");
global.WSSession = null;

webSocket.on("socket/connect", function (session) {
    WSSession = session;
    session.subscribe("device", function (uri, payload) {
        console.log("Device: ", payload.msg);
    });

    session.subscribe("client", function (uri, payload) {
        console.log("Client: ", payload.msg);
    });

    session.publish("device", {msg: "This is a message!"});
});

webSocket.on("socket/disconnect", function (error) {
    //error provides us with some insight into the disconnection: error.reason and error.code
    WSSession = null;
    console.log("Disconnected for " + error.reason + " with code " + error.code);
});
