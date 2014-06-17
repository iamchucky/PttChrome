'use strict';

if (typeof lib != 'undefined')
  throw new Error('Global "lib" object already exists.');

var lib = {};

lib.AppConnection = function(spec) {
  this.host = spec.host;
  this.port = spec.port;
  
  // Callback functions.
  this.callbacks = {
    connect: spec.onConnect,        // Called when socket is connected.
    disconnect: spec.onDisconnect,  // Called when socket is disconnected.
    recv: spec.onReceive,           // Called when client receives data from server.
    sent: spec.onSent,               // Called when client sends data to server.
    paste: spec.onPasteDone,
    storage: spec.onStorageDone,
  };

  this.isConnected = false;
  this.appId = 'hhnlfapopmaimdlldbknjdgekpgffmbo';
  this.appPort = null;
};

lib.AppConnection.prototype.checkChromeApp = function(callback) {
  var appId = this.appId;
  var self = this;
  if (!chrome.runtime) {
    self.showJumbo();
    return;
  }
  chrome.runtime.sendMessage(appId, { action: 'status' }, function(response) {
    if (!response) {
      self.showJumbo();
    } else {
      callback();
    }
  });
};

lib.AppConnection.prototype.showJumbo = function() {
  var self = this;
  $('#getAppBtn').off();
  $('#getAppBtn').click(function() {
    // turn it on when it works
    // chrome.webstore.install();
    window.open('https://chrome.google.com/webstore/detail/pttchrome/'+self.appId, '_self');
  });
  console.log('app is not running or installed');
  $('#getAppBtn').text(i18n('getAppBtn'));
  $('#welcomeJumbo').show();
};

lib.AppConnection.prototype.connect = function(callback) {
  var self = this;
  this.checkChromeApp(function() {
    //var tabid = document.getElementById('cmdHandler').getAttribute('mapcode');
    //_this.so.connect(_this.host, _this.port, tabid);
    self.appPort = chrome.runtime.connect(self.appId);
    self.appPort.onMessage.addListener(function(msg) {
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
        case "onPasteDone":
          self.callbacks.paste(msg.data);
          break;
        case "onStorageDone":
          self.callbacks.storage(msg);
        default:
          break;
      }
    });
    
    self.appPort.onDisconnect.addListener(function(msg) {
      self.callbacks.disconnect();
    });
    self.isConnected = true;
    
    callback();
  });
};

lib.AppConnection.prototype.connectTelnet = function(host, port) {
  if (!this.isConnected) {
    return;
  }
  this.appPort.postMessage({
    action: "connect",
    host: host,
    port: port
  });
};

lib.AppConnection.prototype.sendTelnet = function(str) {
  if (this.appPort == null) {
    return;
  }
  if (!this.isConnected) {
    return;
  }
  this.appPort.postMessage({
    action: 'send',
    data: str
  });
};

lib.AppConnection.prototype.disconnect = function() {
  if (!this.isConnected) {
    return;
  }
  if (this.appPort) {
    try {
      this.appPort.postMessage({ action: 'disconnect' });
    } catch (e) {
    }
  }
  this.isConnected = false;
};

