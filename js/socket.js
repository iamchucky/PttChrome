'use strict';

if (typeof lib != 'undefined')
  throw new Error('Global "lib" object already exists.');

var lib = {};

lib.Socket = function(spec) {
  this.host = spec.host;
  this.port = spec.port;
  
  // Callback functions.
  this.callbacks = {
    connect: spec.onConnect,        // Called when socket is connected.
    disconnect: spec.onDisconnect,  // Called when socket is disconnected.
    recv: spec.onReceive,           // Called when client receives data from server.
    sent: spec.onSent               // Called when client sends data to server.
  };

  // Socket.
  this.socketId = null;
  this.isConnected = false;
  this.appId = 'eodoggnlciofajelomnjiihhnpapoajj';
  this.appSocket = null;
};

lib.Socket.prototype.checkChromeApp = function(callback) {
  var appId = this.appId;
  if (!chrome.runtime) {
    console.log('app is not running or installed');
    return;
  }
  chrome.runtime.sendMessage(appId, { action: 'status' }, function(resposne) {
    if (!response) {
      console.log('app is not running or installed');
    } else {
      callback();
    }
  });
};

lib.Socket.prototype.connect = function() {
  var self = this;
  this.checkChromeApp(function() {
    //var tabid = document.getElementById('cmdHandler').getAttribute('mapcode');
    //_this.so.connect(_this.host, _this.port, tabid);
    self.appSocket = chrome.runtime.connect(self.appId);
    self.appSocket.onMessage.addListener(function(msg) {
      switch(msg.action) {
        case "connected":
          self.callbacks.connect();
          break;
        case "onReceive":
          self.callbacks.recv(msg.data);
          break;
        case "disconnected":
          self.callbacks.disconnect();
          break;
        default:
          break;
      }
    });
    
    self.appSocket.onDisconnect.addListener(function(msg) {
      self.callbacks.disconnect();
    });
    
    self.appSocket.postMessage({
      action: "connect",
      host: self.host,
      port: self.port
    });
  });
};

lib.Socket.prototype.send = function(arrayBuffer) {
  if (this.appSocket == null) {
    return;
  }
  this.appSocket.postMessage({
    action: 'send',
    data: arrayBuffer
  });
};

lib.Socket.prototype.disconnect = function() {
  if (this.appSocket) {
    this.appSocket.postMessage({ action: 'disconnect' });
    this.appSocket = null;
  }
  this.isConnected = false;
};

