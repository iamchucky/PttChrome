if (typeof lib != 'undefined')
  throw new Error('Global "lib" object already exists.');

var lib = {};

lib.AppConnection = function(spec) {
  // Callback functions.
  this.callbacks = {
    connect: spec.onConnect,        // Called when socket is connected.
    disconnect: spec.onDisconnect,  // Called when socket is disconnected.
    recv: spec.onReceive,           // Called when client receives data from server.
    sent: spec.onSent,               // Called when client sends data to server.
    paste: spec.onPasteDone,
    storage: spec.onStorageDone,
    font: spec.onSymFont
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
    if (typeof(chrome) == 'undefined') {
      window.open('https://chrome.google.com/webstore/detail/pttchrome/'+self.appId, '_self');
      return;
    }
    // turn it on when it works
    chrome.webstore.install(undefined, function() {
      // successfully installed
      location.reload();
    });
    //window.open('https://chrome.google.com/webstore/detail/pttchrome/'+self.appId, '_self');
  });
  console.log('app is not running or installed');
  $('#getAppBtn').text(i18n('getAppBtn'));
  for (var i = 1; i < 5; ++i) {
    $('#alreadyInstalledHint'+i).text(i18n('alreadyInstalledHint'+i));
  }
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
          break;
        case "onSymFont":
          self.callbacks.font(msg);
          break;
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

lib.AppConnection.prototype.connectTcp = function(host, port, keepAlive) {
  if (!this.isConnected) {
    return;
  }
  this.appPort.postMessage({
    action: "connect",
    host: host,
    port: port,
    keepAlive: keepAlive
  });
};

lib.AppConnection.prototype.sendTcp = function(str) {
  if (this.appPort === null) {
    return;
  }
  if (!this.isConnected) {
    return;
  }

  // because ptt seems to reponse back slowly after large
  // chunk of text is pasted, so better to split it up.
  var chunk = 1000;
  for (var i = 0; i < str.length; i += chunk) {
    var chunkStr = str.substring(i, i+chunk);
    this.appPort.postMessage({
      action: 'send',
      data: chunkStr
    });
  }
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

