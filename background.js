var webview = null;
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.storage.sync.get(null, function(items) {
    if (items['openInPackagedApp']) {

      chrome.app.window.create('view.html', {
        id: "mainwin",
        bounds: {
          width: 880,
          height: 530
        },
        minWidth: 880,
        minHeight: 530,
      }, function(appWindow) {
        // onloaded
        webview = appWindow.contentWindow
      });

    } else { // if not in or false, this is the default
      chrome.browser.openTab({ 
        url: 'http://iamchucky.github.io/PttChrome/index.html'
      });
    }
  });
});

// somehow I have to create a chrome app window in order to use clipboardWrite
var clipHelper = null;

function createClipboardHelper(callback) {
  chrome.app.window.create('clipboard_helper.html', {
    id: "clipboard_helper",
    hidden: true,
    bounds: {
      width: 0,
      height: 0
    }
  }, function(appWindow) {
    clipHelper = appWindow;
    clipHelper.contentWindow.addEventListener('DOMContentLoaded', function() {
      callback();
    });
  });
}

function doCopy(str) {
  clipHelper.contentWindow.doCopy(str);
}

var pasteInput = document.createElement('textarea');
pasteInput.type = 'text';
document.body.appendChild(pasteInput);

function doPaste() {
  pasteInput.focus();
  var result = '';
  if (document.execCommand('paste')) {
    result = pasteInput.value;
    pasteInput.value = '';
  }
  return result;
}
///

var socketOnRead = {};
var socketOnReadError = {};
function SocketClient(spec) {
  this.host = spec.host;
  this.port = spec.port;

  // Callback functions.
  this.callbacks = {
    connect: spec.onConnect,        // Called when socket is connected.
    disconnect: spec.onDisconnect,  // Called when socket is disconnected.
    recv: spec.onReceive,           // Called when client receives data from server.
    sent: spec.onSent               // Called when client sends data to server.
  };
  this.socketId = null;
}

SocketClient.prototype.connect = function() {
  var self = this;
  chrome.sockets.tcp.create({}, function(createInfo) {
    // onCreate

    self.socketId = createInfo.socketId;
    if (self.socketId > 0) {

      chrome.sockets.tcp.connect(self.socketId, self.host, self.port, function(resultCode) {
          if (resultCode < 0) {
            return console.log('socket connect error');
          }

          // onConnectComplete
          // set keepalive with 10 mins delay
          chrome.sockets.tcp.setKeepAlive(self.socketId, true, 600, function(result) {
            if (result < 0) {
              return console.log('socket set keepalive error');
            }

            socketOnRead[self.socketId] = self._onDataRead.bind(self);
            socketOnReadError[self.socketId] = self._onDataReadError.bind(self);
            if (self.callbacks.connect) {
              //console.log('connect complete');
              self.callbacks.connect();
            }
          });

        });
    } else {
      //error('Unable to create socket');
    }
  });
};

SocketClient.prototype.send = function(arrayBuffer) {
  var self = this;
  chrome.sockets.tcp.send(this.socketId, arrayBuffer, function(sendInfo) {
    //this.log("bytesWritten = " + sendInfo.bytesSent);
    if(sendInfo.resultCode == 0) {
      // write successfully
      if (self.callbacks.sent) {
        self.callbacks.sent();
      }
    } else if (sendInfo.resultCode == -15) {
      // socket is closed
      console.log('socket '+self.socketId+' is closed');
      self.disconnect();
      self.callbacks.disconnect();
    } else if (sendInfo.resultCode < 0) {
      // other errors
      console.log('socket '+self.socketId+' reports resultCode '+sendInfo.resultCode);
    }
  });
};

SocketClient.prototype.disconnect = function() {
  var self = this;
  chrome.sockets.tcp.disconnect(this.socketId, function() {
    chrome.sockets.tcp.close(this.socketId, function() {
      delete socketOnRead[self.socketId];
      delete socketOnReadError[self.socketId];
    });
  });
};

SocketClient.prototype._onDataRead = function(data) {
  if (!this.callbacks.recv) return;

  // Call received callback if there's data in the response.
  var str = String.fromCharCode.apply(null, new Uint8Array(data));
  this.callbacks.recv(str);
};

SocketClient.prototype._onDataReadError = function(resultCode) {
  if (resultCode == -15) {
    console.log('socket '+this.socketId+' is closed');
    this.disconnect();
    if (this.callbacks.disconnect) {
      this.callbacks.disconnect();
    }
  } else {
    console.log('socket returned code '+resultCode);
  }
};

chrome.sockets.tcp.onReceive.addListener(function(resultInfo) {
  if (socketOnRead[resultInfo.socketId]) {
    socketOnRead[resultInfo.socketId](resultInfo.data);
  }
});

chrome.sockets.tcp.onReceiveError.addListener(function(resultInfo) {
  if (socketOnReadError[resultInfo.socketId]) {
    socketOnReadError[resultInfo.socketId](resultInfo.resultCode);
  }
});

// used for only checking status
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.action && request.action == "status") {
    sendResponse({"result":true});
    return;
  }
});

chrome.runtime.onConnectExternal.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    switch(msg.action) {
      case 'connect':
        var so = new SocketClient({
            host: msg.host,
            port: msg.port,

            onConnect: function() {
              port.postMessage({ action: "connected" });
            },

            onDisconnect: function() {
              port.postMessage({action: "disconnected" });
              port.so = null;
            },

            onReceive: function(str) {
              port.postMessage({action: "onReceive", data: str});
            },

            onSent: null
          });

        port.so = so;
        so.connect();
        break;
      case 'send':
        if(port.so && typeof(msg.data) == 'string') {
          var byteArray = new Uint8Array(msg.data.split('').map(function(x){return x.charCodeAt(0);}));
          port.so.send(byteArray.buffer);
        }
        break;
      case 'disconnect':
        if (port.so) {
          port.so.disconnect();
          port.so = null;
        }
        break;
      case 'copy':
        if (!msg.data)
          return;
        if (!clipHelper) {
          createClipboardHelper(function() {
            doCopy(msg.data);
          });
        } else {
          doCopy(msg.data);
        }
        break;
      case 'paste':
        var result = doPaste();
        port.postMessage({ action: 'onPasteDone', data: result});
        break;
      case 'storage':
        var stype = msg.type;
        switch(stype) {
          case 'set':
            if (msg.data && msg.data.values)
              chrome.storage.sync.set(msg.data.values, function() {
                var lastError = chrome.runtime.lastError;
                if (lastError) console.log(lastError);
                if (msg.data && msg.data.logins) {
                  chrome.storage.local.clear(function() {
                    var err = chrome.runtime.lastError;
                    if (err)
                      console.log(err);
                    else {
                      var blacklist = { blacklistedUserIds: msg.data.values.blacklistedUserIds };
                      if (lastError && lastError.message == 'QUOTA_BYTES_PER_ITEM quota exceeded') {
                        msg.data.logins['blacklistedUserIds'] = msg.data.values.blacklistedUserIds;
                        msg.data.values.blacklistedUserIds = '';
                        chrome.storage.sync.set(msg.data.values);
                      }
                      chrome.storage.local.set(msg.data.logins);
                    }
                  });
                }
              });
            break;
          case 'get':
            chrome.storage.sync.get(null, function(items) {
              var itemsEmpty = (Object.keys(items).length === 0);
              if (itemsEmpty) {
                items = JSON.parse(JSON.stringify(msg.defaults.values));
                console.log('pref: first time, load default to sync storage');
                chrome.storage.sync.set(items);
              }
              chrome.storage.local.get(null, function(localItems) {
                var localItemsEmpty = (Object.keys(localItems).length === 0);
                if (localItemsEmpty) {
                  localItems = JSON.parse(JSON.stringify(msg.defaults.logins));
                  chrome.storage.local.set(localItems);
                }
                if (localItems.blacklistedUserIds) {
                  items['blacklistedUserIds'] = localItems.blacklistedUserIds;
                }
                var data = {
                  values: items,
                  logins: { u: localItems.u, p: localItems.p }
                };
                port.postMessage({ action: 'onStorageDone', type: 'get', data: data });
              });
            });
            break;
          case 'clear':
            chrome.storage.local.clear(function() {
              var err = chrome.runtime.lastError;
              if (err)
                console.log(err);
            });
            chrome.storage.sync.clear(function() {
              var err = chrome.runtime.lastError;
              if (err)
                console.log(err);
            });
            break;
          default:
            break;
        }
        break;
      case 'newWindow':
        if (!msg.data)
          return;
        
        if (!clipHelper) {
          createClipboardHelper(function() {
            clipHelper.contentWindow.openWindow(msg.data);
          });
        } else {
          clipHelper.contentWindow.openWindow(msg.data);
        }
        break;
      case 'closeAppWindow':
        if (webview) {
          webview.closeWindow();
        }
        break;
      case 'getSymFont':
        port.postMessage({ action: 'onSymFont', data: symFontBase64 });
        break;
      default:
        break;
    }
  });
  port.onDisconnect.addListener(function(msg) {
    if (clipHelper) {
      clipHelper.close();
      clipHelper = null;
    }
    if (port.so) {
      port.so.disconnect();
      port.so = null;
    }
  });
});

