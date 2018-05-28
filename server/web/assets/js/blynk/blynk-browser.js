(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Blynk = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
        /* Copyright (c) 2015 Volodymyr Shymanskyy. See the file LICENSE for copying permission. */

        var events = require('events');
        var util = require('util');

        if (!window.WebSocket) {
            window.WebSocket = window.MozWebSocket;
        }

        function ab2str(buf) {
            return String.fromCharCode.apply(null, new Uint8Array(buf));
        }

        function str2ab(str) {
            var buf = new ArrayBuffer(str.length); // 2 bytes for each char
            var bufView = new Uint8Array(buf);
            for (var i=0, strLen=str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }

        exports.WsClient = function(options) {
            var self = this;
            events.EventEmitter.call(this);

            var options = options || {};
            self.addr = options.addr || "blynk-cloud.com";
            self.port = options.port || 80;
            self.path = options.path || "/websockets";

            this.write = function(data) {
                if (self.sock) {
                    self.sock.send(str2ab(data));
                }
            };

            this.connect = function(done) {
                if (self.sock) {
                    self.sock.close();
                }
                try {
                    self.sock = new WebSocket('ws://' + self.addr + ':' + self.port + self.path);
                    self.sock.binaryType = 'arraybuffer';
                    self.sock.onopen = function(evt) { done() };
                    self.sock.onclose = function(evt) { self.emit('end'); };
                    self.sock.onmessage = function(evt) {
                        var data = ab2str(evt.data);
                        self.emit('data', data);
                    };
                    self.sock.onerror = function(evt) { self.emit('end'); };
                } catch(exception){
                    console.log(exception);
                }

            };

            this.disconnect = function() {
                if (self.sock) {
                    self.sock.close();
                    self.sock = null;
                }
            };
        };

        util.inherits(exports.WsClient, events.EventEmitter);

    },{"events":5,"util":9}],2:[function(require,module,exports){
        (function (process){
            /* Copyright (c) 2015 Volodymyr Shymanskyy. See the file LICENSE for copying permission. */

            'use strict';

            var C = {
            };

            /*
             * Helpers
             */
            function string_of_enum(e,value)
            {
                for (var k in e) if (e[k] == value) return k;
                return "Unknown(" + value + ")";
            }

            function isEspruino() {
                if (typeof process === 'undefined') return false;
                if (typeof process.env.BOARD === 'undefined') return false;
                return true;
            }

            function isNode() {
                return !isEspruino() && (typeof module !== 'undefined' && ('exports' in module));
            }

            function isBrowser() {
                return (typeof window !== 'undefined');
            }

            function needsEmitter() {
                return isNode();
            }


            function blynkHeader(msg_type, msg_id, msg_len) {
                return String.fromCharCode(
                    msg_type,
                    msg_id  >> 8, msg_id  & 0xFF,
                    msg_len >> 8, msg_len & 0xFF
                );
            }

            var MsgType = {
                RSP           :  0,
                REGISTER      :  1, //"mail pass"
                LOGIN         :  2, //"token" or "mail pass"
                SAVE_PROF     :  3,
                LOAD_PROF     :  4,
                GET_TOKEN     :  5,
                PING          :  6,
                ACTIVATE      :  7, //"DASH_ID"
                DEACTIVATE    :  8, //
                REFRESH       :  9, //"refreshToken DASH_ID"
                TWEET         :  12,
                EMAIL         :  13,
                NOTIFY        :  14,
                BRIDGE        :  15,
                HW_SYNC       :  16,
                INTERNAL      :  17,
                SMS           :  18,
                PROPERTY      :  19,
                HW            :  20,

                REDIRECT      :  41,
                DEBUG_PRINT   :  55,

                EVENT_LOG     :  64,
            };

            var MsgStatus = {
                OK                    :  200,
                ILLEGAL_COMMAND       :  2,
                ALREADY_REGISTERED    :  4,
                INVALID_TOKEN         :  9
            };

            var BlynkState = {
                CONNECTING    :  1,
                CONNECTED     :  2,
                DISCONNECTED  :  3
            };

            if (isBrowser()) {
                var bl_browser = require('./blynk-browser.js');
                var events = require('events');
                var util = require('util');
            } else if (isNode()) {
                var bl_node = require('./blynk-node.js');
                var events = require('events');
                var util = require('util');
            }

            /*
             * Serial
             */
            if (isEspruino()) {

                var EspruinoSerial = function(options) {
                    var self = this;

                    var options = options || {};
                    self.ser  = options.serial || USB;
                    self.conser = options.conser || Serial1;
                    self.baud = options.baud || 9600;

                    this.write = function(data) {
                        self.ser.write(data);
                    };

                    this.connect = function(done) {
                        self.ser.setup(self.baud);
                        self.ser.removeAllListeners('data');
                        self.ser.on('data', function(data) {
                            self.emit('data', data);
                        });
                        if (self.conser) {
                            self.conser.setConsole();
                        }
                        done();
                    };

                    this.disconnect = function() {
                        //self.ser.setConsole();
                    };
                };

                var EspruinoTCP = function(options) {
                    var self = this;

                    var options = options || {};
                    self.addr = options.addr || "blynk-cloud.com";
                    self.port = options.port || 80;

                    var net = require('net');

                    this.write = function(data) {
                        if (self.sock) {
                            self.sock.write(data, 'binary');
                        }
                    };

                    this.connect = function(done) {
                        if (self.sock) {
                            self.disconnect();
                        }
                        console.log("Connecting to TCP:", self.addr, self.port);
                        self.sock = net.connect({host : self.addr, port: self.port}, function() {
                            console.log('Connected');
                            self.sock.on('data', function(data) {
                                self.emit('data', data);
                            });
                            self.sock.on('end', function() {
                                self.emit('end', '');
                            });
                            done();
                        });
                    };

                    this.disconnect = function() {
                        if (self.sock) {
                            self.sock = null;
                        }
                    };
                };

                var BoardEspruinoPico = function(values) {
                    var self = this;
                    this.init = function(blynk) {
                        self.blynk = blynk;
                    };
                    this.process = function(values) {
                        switch(values[0]) {
                            case 'pm':
                                // TODO
                                break;
                            case 'dw':
                                var pin = Pin(values[1]);
                                var val = parseInt(values[2]);
                                pinMode(pin, 'output');
                                digitalWrite(pin, val);
                                break;
                            case 'dr':
                                var pin = Pin(values[1]);
                                self.blynk.sendMsg(MsgType.HW, ['dw', values[1], digitalRead(pin)]);
                                break;
                            case 'aw':
                                var pin = Pin(values[1]);
                                var val = parseFloat(values[2]);
                                pinMode(pin, 'output');
                                analogWrite(pin, val / 255);
                                break;
                            case 'ar':
                                var pin = Pin(values[1]);
                                self.blynk.sendMsg(MsgType.HW, ['aw', values[1], 4095 * analogRead(pin)]);
                                break;
                            default:
                                return null;
                        }
                        return true;
                    };
                };

                var BoardEspruinoLinux = function(values) {
                    var self = this;
                    this.init = function(blynk) {
                        self.blynk = blynk;
                    };
                    this.process = function(values) {
                        switch(values[0]) {
                            case 'pm':
                                // TODO
                                break;
                            case 'dw':
                                var pin = Pin('D' + values[1]);
                                var val = parseInt(values[2]);
                                pinMode(pin, 'output');
                                digitalWrite(pin, val);
                                break;
                            case 'dr':
                                var pin = Pin('D' + values[1]);
                                self.blynk.sendMsg(MsgType.HW, ['dw', values[1], digitalRead(pin)]);
                                break;
                            case 'aw':
                            case 'ar':
                                break;
                            default:
                                return null;
                        }
                        return true;
                    };
                };
            }

            /*
             * Boards
             */

            var BoardDummy = function() {
                this.init = function(blynk) {};
                this.process = function(values) {
                    switch (values[0]) {
                        case 'pm':
                            return true;
                        case 'dw':
                        case 'dr':
                        case 'aw':
                        case 'ar':
                            console.log("No direct pin operations available.");
                            console.log("Maybe you need to install mraa or onoff modules?");
                            return true;
                    }
                };
            };

            /*
             * Blynk
             */

            var Blynk = function(auth, options) {
                var self = this;
                if (needsEmitter()) {
                    events.EventEmitter.call(this);
                }

                this.auth = auth;
                var options = options || {};
                this.heartbeat = options.heartbeat || (10*1000);

                // Auto-detect board
                if (options.board) {
                    this.board = options.board;
                } else if (isEspruino()) {
                    this.board = new BoardEspruinoPico();
                } else if (isBrowser()) {
                    this.board = new BoardDummy();
                } else {
                    [
                        bl_node.BoardMRAA,
                        bl_node.BoardOnOff,
                        BoardDummy
                    ].some(function(b){
                        try {
                            self.board = new b();
                            return true;
                        }
                        catch (e) {
                            return false;
                        }
                    });
                }
                self.board.init(self);

                // Auto-detect connector
                if (options.connector) {
                    this.conn = options.connector;
                } else if (isEspruino()) {
                    this.conn = new EspruinoTCP(options);
                } else if (isBrowser()) {
                    this.conn = new bl_browser.WsClient(options);
                } else {
                    this.conn = new bl_node.SslClient(options);
                }

                this.buff_in = '';
                this.msg_id = 1;
                this.vpins = [];
                this.profile = options.profile;

                this.VirtualPin = function(vPin) {
                    if (needsEmitter()) {
                        events.EventEmitter.call(this);
                    }
                    this.pin = vPin;
                    self.vpins[vPin] = this;

                    this.write = function(value) {
                        self.virtualWrite(this.pin, value);
                    };
                };

                this.WidgetBridge = function(vPin) {
                    this.pin = vPin;

                    this.setAuthToken = function(token) {
                        self.sendMsg(MsgType.BRIDGE, [this.pin, 'i', token]);
                    };
                    this.digitalWrite = function(pin, val) {
                        self.sendMsg(MsgType.BRIDGE, [this.pin, 'dw', pin, val]);
                    };
                    this.analogWrite = function(pin, val) {
                        self.sendMsg(MsgType.BRIDGE, [this.pin, 'aw', pin, val]);
                    };
                    this.virtualWrite = function(pin, val) {
                        self.sendMsg(MsgType.BRIDGE, [this.pin, 'vw', pin].concat(val));
                    };
                };

                this.WidgetTerminal = function(vPin) {
                    if (needsEmitter()) {
                        events.EventEmitter.call(this);
                    }
                    this.pin = vPin;
                    self.vpins[vPin] = this;

                    this.write = function(data) {
                        self.virtualWrite(this.pin, data);
                    };
                };

                this.WidgetLCD = function(vPin) {
                    this.pin = vPin;

                    this.clear = function() {
                        self.virtualWrite(this.pin, 'clr');
                    };
                    this.print = function(x, y, val) {
                        self.sendMsg(MsgType.HW, ['vw', this.pin, 'p', x, y, val]);
                    };
                };

                this.WidgetLED = function(vPin) {
                    this.pin = vPin;

                    this.setValue = function(val) {
                        self.virtualWrite(this.pin, val);
                    };
                    this.turnOn = function() {
                        self.virtualWrite(this.pin, 255);
                    };
                    this.turnOff = function() {
                        self.virtualWrite(this.pin, 0);
                    };
                };

                if (needsEmitter()) {
                    util.inherits(this.VirtualPin, events.EventEmitter);
                    util.inherits(this.WidgetBridge, events.EventEmitter);
                    util.inherits(this.WidgetTerminal, events.EventEmitter);
                }

                if (!options.skip_connect) {
                    this.connect();
                }
            };

            if (needsEmitter()) {
                util.inherits(Blynk, events.EventEmitter);
            }

            Blynk.prototype.onReceive = function(data) {
                var self = this;
                self.buff_in += data;
                while (self.buff_in.length >= 5) {
                    var msg_type = self.buff_in.charCodeAt(0);
                    var msg_id   = self.buff_in.charCodeAt(1) << 8 | self.buff_in.charCodeAt(2);
                    var msg_len  = self.buff_in.charCodeAt(3) << 8 | self.buff_in.charCodeAt(4);

                    if (msg_id === 0)  { return self.disconnect(); }

                    if (msg_type === MsgType.RSP) {
                        //console.log('> ', string_of_enum(MsgType, msg_type), msg_id, string_of_enum(MsgStatus, msg_len));
                        if (!self.profile) {
                            if (self.timerConn && msg_id === 1) {
                                if (msg_len === MsgStatus.OK || msg_len === MsgStatus.ALREADY_REGISTERED) {
                                    clearInterval(self.timerConn);
                                    self.timerConn = null;
                                    self.timerHb = setInterval(function() {
                                        //console.log('Heartbeat');
                                        self.sendMsg(MsgType.PING);
                                    }, self.heartbeat);
                                    console.log('Authorized');
                                    self.sendMsg(MsgType.INTERNAL, ['ver', '0.5.2', 'buff-in', 4096, 'dev', 'js']);
                                    self.emit('connect');
                                } else {
                                    console.log('Could not login:', string_of_enum(MsgStatus, msg_len));
                                    //if invalid token, no point in trying to reconnect
                                    if (msg_len === MsgStatus.INVALID_TOKEN) {
                                        //letting main app know why we failed
                                        self.emit('error', string_of_enum(MsgStatus, msg_len));
                                        //console.log('Disconnecting because of invalid token');
                                        self.disconnect();
                                        if(self.timerConn) {
                                            //clear connecting timer
                                            console.log('clear conn timer');
                                            clearInterval(self.timerConn);
                                            self.timerConn = null;
                                        }
                                    }
                                }
                            }
                        }
                        self.buff_in = self.buff_in.substr(5);
                        continue;
                    }

                    if (msg_len > 4096)  { return self.disconnect(); }
                    if (self.buff_in.length < msg_len+5) {
                        return;
                    }
                    var values = self.buff_in.substr(5, msg_len).split('\0');
                    self.buff_in = self.buff_in.substr(msg_len+5);

                    /*if (msg_len) {
                      console.log('> ', string_of_enum(MsgType, msg_type), msg_id, msg_len, values.join('|'));
                    } else {
                      console.log('> ', string_of_enum(MsgType, msg_type), msg_id, msg_len);
                    }*/

                    if (msg_type === MsgType.LOGIN ||
                        msg_type === MsgType.PING)
                    {
                        self.sendRsp(MsgType.RSP, msg_id, MsgStatus.OK);
                    } else if (msg_type === MsgType.GET_TOKEN) {
                        self.sendRsp(MsgType.GET_TOKEN, msg_id, self.auth.length, self.auth);
                    } else if (msg_type === MsgType.LOAD_PROF) {
                        self.sendRsp(MsgType.LOAD_PROF, msg_id, self.profile.length, self.profile);
                    } else if (msg_type === MsgType.HW ||
                        msg_type === MsgType.BRIDGE)
                    {
                        if (values[0] === 'vw') {
                            var pin = parseInt(values[1]);
                            if (self.vpins[pin]) {
                                self.vpins[pin].emit('write', values.slice(2));
                            }
                        } else if (values[0] === 'vr') {
                            var pin = parseInt(values[1]);
                            if (self.vpins[pin]) {
                                self.vpins[pin].emit('read');
                            }
                        } else if (self.board.process(values)) {

                        } else {
                            console.log('Invalid cmd: ', values[0]);
                            //self.sendRsp(MsgType.RSP, msg_id, MsgStatus.ILLEGAL_COMMAND);
                        }
                    } else if (msg_type === MsgType.REDIRECT) {
                        self.conn.addr = values[0];
                        if (values[1]) {
                            self.conn.port = parseInt(values[1]);
                        }
                        console.log('Redirecting to ', self.conn.addr, ':', self.conn.port);
                        self.disconnect();
                    } else if (msg_type === MsgType.DEBUG_PRINT) {
                        console.log('Server: ', values[0]);
                    } else if (msg_type === MsgType.REGISTER ||
                        msg_type === MsgType.SAVE_PROF ||
                        msg_type === MsgType.INTERNAL ||
                        msg_type === MsgType.ACTIVATE ||
                        msg_type === MsgType.DEACTIVATE ||
                        msg_type === MsgType.REFRESH)
                    {
                        // these make no sense...
                    } else {
                        console.log('Invalid msg type: ', msg_type);
                        self.sendRsp(MsgType.RSP, msg_id, MsgStatus.ILLEGAL_COMMAND);
                    }
                } // end while
            };

            Blynk.prototype.sendRsp = function(msg_type, msg_id, msg_len, data) {
                var self = this;
                data = data || "";
                msg_id = msg_id || (self.msg_id++);
                if (msg_type == MsgType.RSP) {
                    //console.log('< ', string_of_enum(MsgType, msg_type), msg_id, string_of_enum(MsgStatus, msg_len));
                    data = blynkHeader(msg_type, msg_id, msg_len)
                } else {
                    /*if (msg_len) {
                      console.log('< ', string_of_enum(MsgType, msg_type), msg_id, msg_len, data.split('\0').join('|'));
                    } else {
                      console.log('< ', string_of_enum(MsgType, msg_type), msg_id, msg_len);
                    }*/
                    data = blynkHeader(msg_type, msg_id, msg_len) + data;
                }

                self.conn.write(data)

                // TODO: track also recieving time
                /*if (!self.profile) {
                  if (self.timerHb) {
                    clearInterval(self.timerHb);
                    self.timerHb = setInterval(function(){
                      //console.log('Heartbeat');
                      self.sendMsg(MsgType.PING);
                    }, self.heartbeat);
                  }
                }*/
            };

            Blynk.prototype.sendMsg = function(msg_type, values, msg_id) {
                if (this.timerHb) {
                    var values = values || [''];
                    var data = values.join('\0');
                    this.sendRsp(msg_type, msg_id, data.length, data);
                }
            };

            /*
              * API
              */

            Blynk.prototype.connect = function() {
                var self = this;

                var doConnect = function() {
                    if(self.conn) {
                        //cleanup events
                        self.conn.removeAllListeners();
                    }
                    self.conn.connect(function() {
                        self.conn.on('data', function(data) { self.onReceive(data);     });
                        self.conn.on('end',  function()     { self.end();               });

                        self.sendRsp(MsgType.LOGIN, 1, self.auth.length, self.auth);
                    });
                    self.conn.on('error', function(err) { self.error(err);            });
                };

                if (self.profile) {
                    doConnect();
                } else {
                    self.timerConn = setInterval(doConnect, 10000);
                    doConnect();
                }
            };

            Blynk.prototype.disconnect = function(reconnect) {
                console.log('Disconnect blynk');
                if(typeof reconnect === 'undefined' ) {
                    reconnect = true;
                }

                var self = this;
                this.conn.disconnect();
                if (this.timerHb) {
                    clearInterval(this.timerHb);
                    this.timerHb = null;
                }
                this.emit('disconnect');
                //cleanup to avoid multiplying listeners
                this.conn.removeAllListeners();

                //starting reconnect procedure if not already in connecting loop and reconnect is true
                if(reconnect && !self.timerConn) {
                    console.log("REARMING DISCONNECT");
                    setTimeout(function () {self.connect()}, 5000);
                }
            };

            Blynk.prototype.error = function(err) {
                var self = this;
                //if we throw error and user doesn't handle it, app crashes. is it worth it?
                this.emit('error', err.code?err.code:'ERROR');
                console.error('Error', err.code);
                //starting reconnect procedure if not already in connecting loop
                if(!self.timerConn) {
                    setTimeout(function () {self.connect()}, 5000);
                }
            };

            Blynk.prototype.end = function() {
                var self = this;
                self.disconnect();
            };


            Blynk.prototype.virtualWrite = function(pin, val) {
                this.sendMsg(MsgType.HW, ['vw', pin].concat(val));
            };

            Blynk.prototype.setProperty = function(pin, prop, val) {
                this.sendMsg(MsgType.PROPERTY, [pin, prop].concat(val));
            };

            Blynk.prototype.eventLog = function(name, descr) {
                this.sendMsg(MsgType.EVENT_LOG, [name].concat(descr));
            };

            Blynk.prototype.syncAll = function() {
                this.sendMsg(MsgType.HW_SYNC);
            };

            Blynk.prototype.syncVirtual = function(pin) {
                this.sendMsg(MsgType.HW_SYNC, ['vr', pin]);
            };


            Blynk.prototype.email = function(to, topic, message) {
                this.sendMsg(MsgType.EMAIL, [to, topic, message]);
            };

            Blynk.prototype.notify = function(message) {
                this.sendMsg(MsgType.NOTIFY, [message]);
            };

            Blynk.prototype.tweet = function(message) {
                this.sendMsg(MsgType.TWEET, [message]);
            };

            Blynk.prototype.sms = function(message) {
                this.sendMsg(MsgType.SMS, [message]);
            };

            if (typeof module !== 'undefined' && ('exports' in module)) {
                exports.Blynk = Blynk;

                if (isEspruino()) {
                    exports.EspruinoSerial = EspruinoSerial;
                    exports.EspruinoTCP = EspruinoTCP;
                    exports.BoardLinux = BoardEspruinoLinux;
                    exports.BoardPico  = BoardEspruinoPico;
                } else if (isBrowser()) {
                    exports.WsClient = bl_browser.WsClient;
                } else if (isNode()) {
                    exports.TcpClient = bl_node.TcpClient;
                    exports.TcpServer = bl_node.TcpServer;
                    exports.SslClient = bl_node.SslClient;
                    exports.SslServer = bl_node.SslServer;
                    exports.BoardOnOff = bl_node.BoardOnOff;
                    exports.BoardMRAA = bl_node.BoardMRAA;
                }
            }

        }).call(this,require('_process'))
    },{"./blynk-browser.js":1,"./blynk-node.js":4,"_process":6,"events":5,"net":3,"util":9}],3:[function(require,module,exports){

    },{}],4:[function(require,module,exports){
        arguments[4][3][0].apply(exports,arguments)
    },{"dup":3}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

        var objectCreate = Object.create || objectCreatePolyfill
        var objectKeys = Object.keys || objectKeysPolyfill
        var bind = Function.prototype.bind || functionBindPolyfill

        function EventEmitter() {
            if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
                this._events = objectCreate(null);
                this._eventsCount = 0;
            }

            this._maxListeners = this._maxListeners || undefined;
        }
        module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
        EventEmitter.EventEmitter = EventEmitter;

        EventEmitter.prototype._events = undefined;
        EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
        var defaultMaxListeners = 10;

        var hasDefineProperty;
        try {
            var o = {};
            if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
            hasDefineProperty = o.x === 0;
        } catch (err) { hasDefineProperty = false }
        if (hasDefineProperty) {
            Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
                enumerable: true,
                get: function() {
                    return defaultMaxListeners;
                },
                set: function(arg) {
                    // check whether the input is a positive number (whose value is zero or
                    // greater and not a NaN).
                    if (typeof arg !== 'number' || arg < 0 || arg !== arg)
                        throw new TypeError('"defaultMaxListeners" must be a positive number');
                    defaultMaxListeners = arg;
                }
            });
        } else {
            EventEmitter.defaultMaxListeners = defaultMaxListeners;
        }

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
        EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
            if (typeof n !== 'number' || n < 0 || isNaN(n))
                throw new TypeError('"n" argument must be a positive number');
            this._maxListeners = n;
            return this;
        };

        function $getMaxListeners(that) {
            if (that._maxListeners === undefined)
                return EventEmitter.defaultMaxListeners;
            return that._maxListeners;
        }

        EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
            return $getMaxListeners(this);
        };

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
        function emitNone(handler, isFn, self) {
            if (isFn)
                handler.call(self);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].call(self);
            }
        }
        function emitOne(handler, isFn, self, arg1) {
            if (isFn)
                handler.call(self, arg1);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].call(self, arg1);
            }
        }
        function emitTwo(handler, isFn, self, arg1, arg2) {
            if (isFn)
                handler.call(self, arg1, arg2);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].call(self, arg1, arg2);
            }
        }
        function emitThree(handler, isFn, self, arg1, arg2, arg3) {
            if (isFn)
                handler.call(self, arg1, arg2, arg3);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].call(self, arg1, arg2, arg3);
            }
        }

        function emitMany(handler, isFn, self, args) {
            if (isFn)
                handler.apply(self, args);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].apply(self, args);
            }
        }

        EventEmitter.prototype.emit = function emit(type) {
            var er, handler, len, args, i, events;
            var doError = (type === 'error');

            events = this._events;
            if (events)
                doError = (doError && events.error == null);
            else if (!doError)
                return false;

            // If there is no 'error' event listener then throw.
            if (doError) {
                if (arguments.length > 1)
                    er = arguments[1];
                if (er instanceof Error) {
                    throw er; // Unhandled 'error' event
                } else {
                    // At least give some kind of context to the user
                    var err = new Error('Unhandled "error" event. (' + er + ')');
                    err.context = er;
                    throw err;
                }
                return false;
            }

            handler = events[type];

            if (!handler)
                return false;

            var isFn = typeof handler === 'function';
            len = arguments.length;
            switch (len) {
                // fast cases
                case 1:
                    emitNone(handler, isFn, this);
                    break;
                case 2:
                    emitOne(handler, isFn, this, arguments[1]);
                    break;
                case 3:
                    emitTwo(handler, isFn, this, arguments[1], arguments[2]);
                    break;
                case 4:
                    emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
                    break;
                // slower
                default:
                    args = new Array(len - 1);
                    for (i = 1; i < len; i++)
                        args[i - 1] = arguments[i];
                    emitMany(handler, isFn, this, args);
            }

            return true;
        };

        function _addListener(target, type, listener, prepend) {
            var m;
            var events;
            var existing;

            if (typeof listener !== 'function')
                throw new TypeError('"listener" argument must be a function');

            events = target._events;
            if (!events) {
                events = target._events = objectCreate(null);
                target._eventsCount = 0;
            } else {
                // To avoid recursion in the case that type === "newListener"! Before
                // adding it to the listeners, first emit "newListener".
                if (events.newListener) {
                    target.emit('newListener', type,
                        listener.listener ? listener.listener : listener);

                    // Re-assign `events` because a newListener handler could have caused the
                    // this._events to be assigned to a new object
                    events = target._events;
                }
                existing = events[type];
            }

            if (!existing) {
                // Optimize the case of one listener. Don't need the extra array object.
                existing = events[type] = listener;
                ++target._eventsCount;
            } else {
                if (typeof existing === 'function') {
                    // Adding the second element, need to change to array.
                    existing = events[type] =
                        prepend ? [listener, existing] : [existing, listener];
                } else {
                    // If we've already got an array, just append.
                    if (prepend) {
                        existing.unshift(listener);
                    } else {
                        existing.push(listener);
                    }
                }

                // Check for listener leak
                if (!existing.warned) {
                    m = $getMaxListeners(target);
                    if (m && m > 0 && existing.length > m) {
                        existing.warned = true;
                        var w = new Error('Possible EventEmitter memory leak detected. ' +
                            existing.length + ' "' + String(type) + '" listeners ' +
                            'added. Use emitter.setMaxListeners() to ' +
                            'increase limit.');
                        w.name = 'MaxListenersExceededWarning';
                        w.emitter = target;
                        w.type = type;
                        w.count = existing.length;
                        if (typeof console === 'object' && console.warn) {
                            console.warn('%s: %s', w.name, w.message);
                        }
                    }
                }
            }

            return target;
        }

        EventEmitter.prototype.addListener = function addListener(type, listener) {
            return _addListener(this, type, listener, false);
        };

        EventEmitter.prototype.on = EventEmitter.prototype.addListener;

        EventEmitter.prototype.prependListener =
            function prependListener(type, listener) {
                return _addListener(this, type, listener, true);
            };

        function onceWrapper() {
            if (!this.fired) {
                this.target.removeListener(this.type, this.wrapFn);
                this.fired = true;
                switch (arguments.length) {
                    case 0:
                        return this.listener.call(this.target);
                    case 1:
                        return this.listener.call(this.target, arguments[0]);
                    case 2:
                        return this.listener.call(this.target, arguments[0], arguments[1]);
                    case 3:
                        return this.listener.call(this.target, arguments[0], arguments[1],
                            arguments[2]);
                    default:
                        var args = new Array(arguments.length);
                        for (var i = 0; i < args.length; ++i)
                            args[i] = arguments[i];
                        this.listener.apply(this.target, args);
                }
            }
        }

        function _onceWrap(target, type, listener) {
            var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
            var wrapped = bind.call(onceWrapper, state);
            wrapped.listener = listener;
            state.wrapFn = wrapped;
            return wrapped;
        }

        EventEmitter.prototype.once = function once(type, listener) {
            if (typeof listener !== 'function')
                throw new TypeError('"listener" argument must be a function');
            this.on(type, _onceWrap(this, type, listener));
            return this;
        };

        EventEmitter.prototype.prependOnceListener =
            function prependOnceListener(type, listener) {
                if (typeof listener !== 'function')
                    throw new TypeError('"listener" argument must be a function');
                this.prependListener(type, _onceWrap(this, type, listener));
                return this;
            };

// Emits a 'removeListener' event if and only if the listener was removed.
        EventEmitter.prototype.removeListener =
            function removeListener(type, listener) {
                var list, events, position, i, originalListener;

                if (typeof listener !== 'function')
                    throw new TypeError('"listener" argument must be a function');

                events = this._events;
                if (!events)
                    return this;

                list = events[type];
                if (!list)
                    return this;

                if (list === listener || list.listener === listener) {
                    if (--this._eventsCount === 0)
                        this._events = objectCreate(null);
                    else {
                        delete events[type];
                        if (events.removeListener)
                            this.emit('removeListener', type, list.listener || listener);
                    }
                } else if (typeof list !== 'function') {
                    position = -1;

                    for (i = list.length - 1; i >= 0; i--) {
                        if (list[i] === listener || list[i].listener === listener) {
                            originalListener = list[i].listener;
                            position = i;
                            break;
                        }
                    }

                    if (position < 0)
                        return this;

                    if (position === 0)
                        list.shift();
                    else
                        spliceOne(list, position);

                    if (list.length === 1)
                        events[type] = list[0];

                    if (events.removeListener)
                        this.emit('removeListener', type, originalListener || listener);
                }

                return this;
            };

        EventEmitter.prototype.removeAllListeners =
            function removeAllListeners(type) {
                var listeners, events, i;

                events = this._events;
                if (!events)
                    return this;

                // not listening for removeListener, no need to emit
                if (!events.removeListener) {
                    if (arguments.length === 0) {
                        this._events = objectCreate(null);
                        this._eventsCount = 0;
                    } else if (events[type]) {
                        if (--this._eventsCount === 0)
                            this._events = objectCreate(null);
                        else
                            delete events[type];
                    }
                    return this;
                }

                // emit removeListener for all listeners on all events
                if (arguments.length === 0) {
                    var keys = objectKeys(events);
                    var key;
                    for (i = 0; i < keys.length; ++i) {
                        key = keys[i];
                        if (key === 'removeListener') continue;
                        this.removeAllListeners(key);
                    }
                    this.removeAllListeners('removeListener');
                    this._events = objectCreate(null);
                    this._eventsCount = 0;
                    return this;
                }

                listeners = events[type];

                if (typeof listeners === 'function') {
                    this.removeListener(type, listeners);
                } else if (listeners) {
                    // LIFO order
                    for (i = listeners.length - 1; i >= 0; i--) {
                        this.removeListener(type, listeners[i]);
                    }
                }

                return this;
            };

        EventEmitter.prototype.listeners = function listeners(type) {
            var evlistener;
            var ret;
            var events = this._events;

            if (!events)
                ret = [];
            else {
                evlistener = events[type];
                if (!evlistener)
                    ret = [];
                else if (typeof evlistener === 'function')
                    ret = [evlistener.listener || evlistener];
                else
                    ret = unwrapListeners(evlistener);
            }

            return ret;
        };

        EventEmitter.listenerCount = function(emitter, type) {
            if (typeof emitter.listenerCount === 'function') {
                return emitter.listenerCount(type);
            } else {
                return listenerCount.call(emitter, type);
            }
        };

        EventEmitter.prototype.listenerCount = listenerCount;
        function listenerCount(type) {
            var events = this._events;

            if (events) {
                var evlistener = events[type];

                if (typeof evlistener === 'function') {
                    return 1;
                } else if (evlistener) {
                    return evlistener.length;
                }
            }

            return 0;
        }

        EventEmitter.prototype.eventNames = function eventNames() {
            return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
        };

// About 1.5x faster than the two-arg version of Array#splice().
        function spliceOne(list, index) {
            for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
                list[i] = list[k];
            list.pop();
        }

        function arrayClone(arr, n) {
            var copy = new Array(n);
            for (var i = 0; i < n; ++i)
                copy[i] = arr[i];
            return copy;
        }

        function unwrapListeners(arr) {
            var ret = new Array(arr.length);
            for (var i = 0; i < ret.length; ++i) {
                ret[i] = arr[i].listener || arr[i];
            }
            return ret;
        }

        function objectCreatePolyfill(proto) {
            var F = function() {};
            F.prototype = proto;
            return new F;
        }
        function objectKeysPolyfill(obj) {
            var keys = [];
            for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
            return k;
        }
        function functionBindPolyfill(context) {
            var fn = this;
            return function () {
                return fn.apply(context, arguments);
            };
        }

    },{}],6:[function(require,module,exports){
// shim for using process in browser
        var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

        var cachedSetTimeout;
        var cachedClearTimeout;

        function defaultSetTimout() {
            throw new Error('setTimeout has not been defined');
        }
        function defaultClearTimeout () {
            throw new Error('clearTimeout has not been defined');
        }
        (function () {
            try {
                if (typeof setTimeout === 'function') {
                    cachedSetTimeout = setTimeout;
                } else {
                    cachedSetTimeout = defaultSetTimout;
                }
            } catch (e) {
                cachedSetTimeout = defaultSetTimout;
            }
            try {
                if (typeof clearTimeout === 'function') {
                    cachedClearTimeout = clearTimeout;
                } else {
                    cachedClearTimeout = defaultClearTimeout;
                }
            } catch (e) {
                cachedClearTimeout = defaultClearTimeout;
            }
        } ())
        function runTimeout(fun) {
            if (cachedSetTimeout === setTimeout) {
                //normal enviroments in sane situations
                return setTimeout(fun, 0);
            }
            // if setTimeout wasn't available but was latter defined
            if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                cachedSetTimeout = setTimeout;
                return setTimeout(fun, 0);
            }
            try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedSetTimeout(fun, 0);
            } catch(e){
                try {
                    // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                    return cachedSetTimeout.call(null, fun, 0);
                } catch(e){
                    // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                    return cachedSetTimeout.call(this, fun, 0);
                }
            }


        }
        function runClearTimeout(marker) {
            if (cachedClearTimeout === clearTimeout) {
                //normal enviroments in sane situations
                return clearTimeout(marker);
            }
            // if clearTimeout wasn't available but was latter defined
            if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                cachedClearTimeout = clearTimeout;
                return clearTimeout(marker);
            }
            try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedClearTimeout(marker);
            } catch (e){
                try {
                    // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                    return cachedClearTimeout.call(null, marker);
                } catch (e){
                    // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                    // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                    return cachedClearTimeout.call(this, marker);
                }
            }



        }
        var queue = [];
        var draining = false;
        var currentQueue;
        var queueIndex = -1;

        function cleanUpNextTick() {
            if (!draining || !currentQueue) {
                return;
            }
            draining = false;
            if (currentQueue.length) {
                queue = currentQueue.concat(queue);
            } else {
                queueIndex = -1;
            }
            if (queue.length) {
                drainQueue();
            }
        }

        function drainQueue() {
            if (draining) {
                return;
            }
            var timeout = runTimeout(cleanUpNextTick);
            draining = true;

            var len = queue.length;
            while(len) {
                currentQueue = queue;
                queue = [];
                while (++queueIndex < len) {
                    if (currentQueue) {
                        currentQueue[queueIndex].run();
                    }
                }
                queueIndex = -1;
                len = queue.length;
            }
            currentQueue = null;
            draining = false;
            runClearTimeout(timeout);
        }

        process.nextTick = function (fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i];
                }
            }
            queue.push(new Item(fun, args));
            if (queue.length === 1 && !draining) {
                runTimeout(drainQueue);
            }
        };

// v8 likes predictible objects
        function Item(fun, array) {
            this.fun = fun;
            this.array = array;
        }
        Item.prototype.run = function () {
            this.fun.apply(null, this.array);
        };
        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = ''; // empty string to avoid regexp issues
        process.versions = {};

        function noop() {}

        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.prependListener = noop;
        process.prependOnceListener = noop;

        process.listeners = function (name) { return [] }

        process.binding = function (name) {
            throw new Error('process.binding is not supported');
        };

        process.cwd = function () { return '/' };
        process.chdir = function (dir) {
            throw new Error('process.chdir is not supported');
        };
        process.umask = function() { return 0; };

    },{}],7:[function(require,module,exports){
        if (typeof Object.create === 'function') {
            // implementation from standard node.js 'util' module
            module.exports = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor
                ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            };
        } else {
            // old school shim for old browsers
            module.exports = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor
                var TempCtor = function () {}
                TempCtor.prototype = superCtor.prototype
                ctor.prototype = new TempCtor()
                ctor.prototype.constructor = ctor
            }
        }

    },{}],8:[function(require,module,exports){
        module.exports = function isBuffer(arg) {
            return arg && typeof arg === 'object'
                && typeof arg.copy === 'function'
                && typeof arg.fill === 'function'
                && typeof arg.readUInt8 === 'function';
        }
    },{}],9:[function(require,module,exports){
        (function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

            var formatRegExp = /%[sdj%]/g;
            exports.format = function(f) {
                if (!isString(f)) {
                    var objects = [];
                    for (var i = 0; i < arguments.length; i++) {
                        objects.push(inspect(arguments[i]));
                    }
                    return objects.join(' ');
                }

                var i = 1;
                var args = arguments;
                var len = args.length;
                var str = String(f).replace(formatRegExp, function(x) {
                    if (x === '%%') return '%';
                    if (i >= len) return x;
                    switch (x) {
                        case '%s': return String(args[i++]);
                        case '%d': return Number(args[i++]);
                        case '%j':
                            try {
                                return JSON.stringify(args[i++]);
                            } catch (_) {
                                return '[Circular]';
                            }
                        default:
                            return x;
                    }
                });
                for (var x = args[i]; i < len; x = args[++i]) {
                    if (isNull(x) || !isObject(x)) {
                        str += ' ' + x;
                    } else {
                        str += ' ' + inspect(x);
                    }
                }
                return str;
            };


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
            exports.deprecate = function(fn, msg) {
                // Allow for deprecating things in the process of starting up.
                if (isUndefined(global.process)) {
                    return function() {
                        return exports.deprecate(fn, msg).apply(this, arguments);
                    };
                }

                if (process.noDeprecation === true) {
                    return fn;
                }

                var warned = false;
                function deprecated() {
                    if (!warned) {
                        if (process.throwDeprecation) {
                            throw new Error(msg);
                        } else if (process.traceDeprecation) {
                            console.trace(msg);
                        } else {
                            console.error(msg);
                        }
                        warned = true;
                    }
                    return fn.apply(this, arguments);
                }

                return deprecated;
            };


            var debugs = {};
            var debugEnviron;
            exports.debuglog = function(set) {
                if (isUndefined(debugEnviron))
                    debugEnviron = process.env.NODE_DEBUG || '';
                set = set.toUpperCase();
                if (!debugs[set]) {
                    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
                        var pid = process.pid;
                        debugs[set] = function() {
                            var msg = exports.format.apply(exports, arguments);
                            console.error('%s %d: %s', set, pid, msg);
                        };
                    } else {
                        debugs[set] = function() {};
                    }
                }
                return debugs[set];
            };


            /**
             * Echos the value of a value. Trys to print the value out
             * in the best way possible given the different types.
             *
             * @param {Object} obj The object to print out.
             * @param {Object} opts Optional options object that alters the output.
             */
            /* legacy: obj, showHidden, depth, colors*/
            function inspect(obj, opts) {
                // default options
                var ctx = {
                    seen: [],
                    stylize: stylizeNoColor
                };
                // legacy...
                if (arguments.length >= 3) ctx.depth = arguments[2];
                if (arguments.length >= 4) ctx.colors = arguments[3];
                if (isBoolean(opts)) {
                    // legacy...
                    ctx.showHidden = opts;
                } else if (opts) {
                    // got an "options" object
                    exports._extend(ctx, opts);
                }
                // set default options
                if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
                if (isUndefined(ctx.depth)) ctx.depth = 2;
                if (isUndefined(ctx.colors)) ctx.colors = false;
                if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
                if (ctx.colors) ctx.stylize = stylizeWithColor;
                return formatValue(ctx, obj, ctx.depth);
            }
            exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
            inspect.colors = {
                'bold' : [1, 22],
                'italic' : [3, 23],
                'underline' : [4, 24],
                'inverse' : [7, 27],
                'white' : [37, 39],
                'grey' : [90, 39],
                'black' : [30, 39],
                'blue' : [34, 39],
                'cyan' : [36, 39],
                'green' : [32, 39],
                'magenta' : [35, 39],
                'red' : [31, 39],
                'yellow' : [33, 39]
            };

// Don't use 'blue' not visible on cmd.exe
            inspect.styles = {
                'special': 'cyan',
                'number': 'yellow',
                'boolean': 'yellow',
                'undefined': 'grey',
                'null': 'bold',
                'string': 'green',
                'date': 'magenta',
                // "name": intentionally not styling
                'regexp': 'red'
            };


            function stylizeWithColor(str, styleType) {
                var style = inspect.styles[styleType];

                if (style) {
                    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
                        '\u001b[' + inspect.colors[style][1] + 'm';
                } else {
                    return str;
                }
            }


            function stylizeNoColor(str, styleType) {
                return str;
            }


            function arrayToHash(array) {
                var hash = {};

                array.forEach(function(val, idx) {
                    hash[val] = true;
                });

                return hash;
            }


            function formatValue(ctx, value, recurseTimes) {
                // Provide a hook for user-specified inspect functions.
                // Check that value is an object with an inspect function on it
                if (ctx.customInspect &&
                    value &&
                    isFunction(value.inspect) &&
                    // Filter out the util module, it's inspect function is special
                    value.inspect !== exports.inspect &&
                    // Also filter out any prototype objects using the circular check.
                    !(value.constructor && value.constructor.prototype === value)) {
                    var ret = value.inspect(recurseTimes, ctx);
                    if (!isString(ret)) {
                        ret = formatValue(ctx, ret, recurseTimes);
                    }
                    return ret;
                }

                // Primitive types cannot have properties
                var primitive = formatPrimitive(ctx, value);
                if (primitive) {
                    return primitive;
                }

                // Look up the keys of the object.
                var keys = Object.keys(value);
                var visibleKeys = arrayToHash(keys);

                if (ctx.showHidden) {
                    keys = Object.getOwnPropertyNames(value);
                }

                // IE doesn't make error fields non-enumerable
                // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
                if (isError(value)
                    && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
                    return formatError(value);
                }

                // Some type of object without properties can be shortcutted.
                if (keys.length === 0) {
                    if (isFunction(value)) {
                        var name = value.name ? ': ' + value.name : '';
                        return ctx.stylize('[Function' + name + ']', 'special');
                    }
                    if (isRegExp(value)) {
                        return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                    }
                    if (isDate(value)) {
                        return ctx.stylize(Date.prototype.toString.call(value), 'date');
                    }
                    if (isError(value)) {
                        return formatError(value);
                    }
                }

                var base = '', array = false, braces = ['{', '}'];

                // Make Array say that they are Array
                if (isArray(value)) {
                    array = true;
                    braces = ['[', ']'];
                }

                // Make functions say that they are functions
                if (isFunction(value)) {
                    var n = value.name ? ': ' + value.name : '';
                    base = ' [Function' + n + ']';
                }

                // Make RegExps say that they are RegExps
                if (isRegExp(value)) {
                    base = ' ' + RegExp.prototype.toString.call(value);
                }

                // Make dates with properties first say the date
                if (isDate(value)) {
                    base = ' ' + Date.prototype.toUTCString.call(value);
                }

                // Make error with message first say the error
                if (isError(value)) {
                    base = ' ' + formatError(value);
                }

                if (keys.length === 0 && (!array || value.length == 0)) {
                    return braces[0] + base + braces[1];
                }

                if (recurseTimes < 0) {
                    if (isRegExp(value)) {
                        return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                    } else {
                        return ctx.stylize('[Object]', 'special');
                    }
                }

                ctx.seen.push(value);

                var output;
                if (array) {
                    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
                } else {
                    output = keys.map(function(key) {
                        return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                    });
                }

                ctx.seen.pop();

                return reduceToSingleString(output, base, braces);
            }


            function formatPrimitive(ctx, value) {
                if (isUndefined(value))
                    return ctx.stylize('undefined', 'undefined');
                if (isString(value)) {
                    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                        .replace(/'/g, "\\'")
                        .replace(/\\"/g, '"') + '\'';
                    return ctx.stylize(simple, 'string');
                }
                if (isNumber(value))
                    return ctx.stylize('' + value, 'number');
                if (isBoolean(value))
                    return ctx.stylize('' + value, 'boolean');
                // For some reason typeof null is "object", so special case here.
                if (isNull(value))
                    return ctx.stylize('null', 'null');
            }


            function formatError(value) {
                return '[' + Error.prototype.toString.call(value) + ']';
            }


            function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
                var output = [];
                for (var i = 0, l = value.length; i < l; ++i) {
                    if (hasOwnProperty(value, String(i))) {
                        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                            String(i), true));
                    } else {
                        output.push('');
                    }
                }
                keys.forEach(function(key) {
                    if (!key.match(/^\d+$/)) {
                        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                            key, true));
                    }
                });
                return output;
            }


            function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
                var name, str, desc;
                desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
                if (desc.get) {
                    if (desc.set) {
                        str = ctx.stylize('[Getter/Setter]', 'special');
                    } else {
                        str = ctx.stylize('[Getter]', 'special');
                    }
                } else {
                    if (desc.set) {
                        str = ctx.stylize('[Setter]', 'special');
                    }
                }
                if (!hasOwnProperty(visibleKeys, key)) {
                    name = '[' + key + ']';
                }
                if (!str) {
                    if (ctx.seen.indexOf(desc.value) < 0) {
                        if (isNull(recurseTimes)) {
                            str = formatValue(ctx, desc.value, null);
                        } else {
                            str = formatValue(ctx, desc.value, recurseTimes - 1);
                        }
                        if (str.indexOf('\n') > -1) {
                            if (array) {
                                str = str.split('\n').map(function(line) {
                                    return '  ' + line;
                                }).join('\n').substr(2);
                            } else {
                                str = '\n' + str.split('\n').map(function(line) {
                                    return '   ' + line;
                                }).join('\n');
                            }
                        }
                    } else {
                        str = ctx.stylize('[Circular]', 'special');
                    }
                }
                if (isUndefined(name)) {
                    if (array && key.match(/^\d+$/)) {
                        return str;
                    }
                    name = JSON.stringify('' + key);
                    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                        name = name.substr(1, name.length - 2);
                        name = ctx.stylize(name, 'name');
                    } else {
                        name = name.replace(/'/g, "\\'")
                            .replace(/\\"/g, '"')
                            .replace(/(^"|"$)/g, "'");
                        name = ctx.stylize(name, 'string');
                    }
                }

                return name + ': ' + str;
            }


            function reduceToSingleString(output, base, braces) {
                var numLinesEst = 0;
                var length = output.reduce(function(prev, cur) {
                    numLinesEst++;
                    if (cur.indexOf('\n') >= 0) numLinesEst++;
                    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
                }, 0);

                if (length > 60) {
                    return braces[0] +
                        (base === '' ? '' : base + '\n ') +
                        ' ' +
                        output.join(',\n  ') +
                        ' ' +
                        braces[1];
                }

                return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
            }


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
            function isArray(ar) {
                return Array.isArray(ar);
            }
            exports.isArray = isArray;

            function isBoolean(arg) {
                return typeof arg === 'boolean';
            }
            exports.isBoolean = isBoolean;

            function isNull(arg) {
                return arg === null;
            }
            exports.isNull = isNull;

            function isNullOrUndefined(arg) {
                return arg == null;
            }
            exports.isNullOrUndefined = isNullOrUndefined;

            function isNumber(arg) {
                return typeof arg === 'number';
            }
            exports.isNumber = isNumber;

            function isString(arg) {
                return typeof arg === 'string';
            }
            exports.isString = isString;

            function isSymbol(arg) {
                return typeof arg === 'symbol';
            }
            exports.isSymbol = isSymbol;

            function isUndefined(arg) {
                return arg === void 0;
            }
            exports.isUndefined = isUndefined;

            function isRegExp(re) {
                return isObject(re) && objectToString(re) === '[object RegExp]';
            }
            exports.isRegExp = isRegExp;

            function isObject(arg) {
                return typeof arg === 'object' && arg !== null;
            }
            exports.isObject = isObject;

            function isDate(d) {
                return isObject(d) && objectToString(d) === '[object Date]';
            }
            exports.isDate = isDate;

            function isError(e) {
                return isObject(e) &&
                    (objectToString(e) === '[object Error]' || e instanceof Error);
            }
            exports.isError = isError;

            function isFunction(arg) {
                return typeof arg === 'function';
            }
            exports.isFunction = isFunction;

            function isPrimitive(arg) {
                return arg === null ||
                    typeof arg === 'boolean' ||
                    typeof arg === 'number' ||
                    typeof arg === 'string' ||
                    typeof arg === 'symbol' ||  // ES6 symbol
                    typeof arg === 'undefined';
            }
            exports.isPrimitive = isPrimitive;

            exports.isBuffer = require('./support/isBuffer');

            function objectToString(o) {
                return Object.prototype.toString.call(o);
            }


            function pad(n) {
                return n < 10 ? '0' + n.toString(10) : n.toString(10);
            }


            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
            function timestamp() {
                var d = new Date();
                var time = [pad(d.getHours()),
                    pad(d.getMinutes()),
                    pad(d.getSeconds())].join(':');
                return [d.getDate(), months[d.getMonth()], time].join(' ');
            }


// log is just a thin wrapper to console.log that prepends a timestamp
            exports.log = function() {
                console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
            };


            /**
             * Inherit the prototype methods from one constructor into another.
             *
             * The Function.prototype.inherits from lang.js rewritten as a standalone
             * function (not on Function.prototype). NOTE: If this file is to be loaded
             * during bootstrapping this function needs to be rewritten using some native
             * functions as prototype setup using normal JavaScript does not work as
             * expected during bootstrapping (see mirror.js in r114903).
             *
             * @param {function} ctor Constructor function which needs to inherit the
             *     prototype.
             * @param {function} superCtor Constructor function to inherit prototype from.
             */
            exports.inherits = require('inherits');

            exports._extend = function(origin, add) {
                // Don't do anything if add isn't an object
                if (!add || !isObject(add)) return origin;

                var keys = Object.keys(add);
                var i = keys.length;
                while (i--) {
                    origin[keys[i]] = add[keys[i]];
                }
                return origin;
            };

            function hasOwnProperty(obj, prop) {
                return Object.prototype.hasOwnProperty.call(obj, prop);
            }

        }).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    },{"./support/isBuffer":8,"_process":6,"inherits":7}]},{},[2])(2)
});