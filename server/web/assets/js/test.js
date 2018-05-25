var Blynk = require('blynk-library');

var AUTH = '03f1323b6a5548b288c34c65a0ddca5d';

var blynk = new Blynk.Blynk(AUTH, options = {
    connector : new Blynk.TcpClient( options = { addr:"gps-tracker.ml", port:8441 } )
});

var v1 = new blynk.VirtualPin(1);
var v9 = new blynk.VirtualPin(9);

v1.on('write', function(param) {
    console.log('V1:', param);
});

v9.on('read', function() {
    v9.write(new Date().getSeconds());
});

blynk.on('connect', function() { console.log("Blynk ready."); });
blynk.on('disconnect', function() { console.log("DISCONNECT"); });
