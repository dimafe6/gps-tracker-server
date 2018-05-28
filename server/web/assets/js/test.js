var Blynk = require('blynk-library');

var AUTH = 'a1436b98817c426ea91740829e164a3f';

var blynk = new Blynk.Blynk(AUTH);

var v1 = new blynk.VirtualPin(1);
var v12 = new blynk.VirtualPin(12);

v1.on('write', function(param) {
    console.log('V1:', param);
});

v12.on('read', function() {
    v12.write(new Date().getSeconds());
});

blynk.on('connect', function() { console.log("Blynk ready."); });
blynk.on('disconnect', function() { console.log("DISCONNECT"); });
