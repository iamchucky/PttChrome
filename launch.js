/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */

var webview = null;
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.storage.sync.get(null, function(items) {
    if ('openInPackagedApp' in items && items['openInPackagedApp']) {

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
      window.open('http://iamchucky.github.io/PttChrome/');
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
  this.isConnected = false;
}

SocketClient.prototype.connect = function() {
  chrome.socket.create('tcp', {}, this._onCreate.bind(this));
};

SocketClient.prototype.send = function(arrayBuffer) {
  chrome.socket.write(this.socketId, arrayBuffer, this._onWriteComplete.bind(this));
};

SocketClient.prototype.disconnect = function() {
  chrome.socket.disconnect(this.socketId);
  chrome.socket.destroy(this.socketId);
  this.isConnected = false;
};

SocketClient.prototype._onCreate = function(createInfo) {
  this.socketId = createInfo.socketId;
  if (this.socketId > 0) {
    chrome.socket.connect(
        this.socketId, this.host, this.port, 
        this._onConnectComplete.bind(this));
    this.isConnected = true;
  } else {
    //error('Unable to create socket');
  }
};

SocketClient.prototype._onConnectComplete = function(resultCode) {
  // Start polling for reads.
  chrome.socket.read(this.socketId, this._onDataRead.bind(this));
  if (this.callbacks.connect) {
    //console.log('connect complete');
    this.callbacks.connect();
  } else {
  }
  //log('onConnectComplete');
};

SocketClient.prototype._onDataRead = function(readInfo) {
  // Call received callback if there's data in the response.
  var msecBetweenReads = 10;
  var self = this;
  if (readInfo.resultCode > 0 && this.callbacks.recv) {
    var str = String.fromCharCode.apply(null, new Uint8Array(readInfo.data));
    this.callbacks.recv(str);
    setTimeout(function() {
      chrome.socket.read(self.socketId, self._onDataRead.bind(self));
    }, msecBetweenReads);
  } else if (readInfo.resultCode == -15) {
    //socket is closed
    console.log('socket is closed');
    this.disconnect();
    this.callbacks.disconnect();
  } else {
    // other errors
  }
};
SocketClient.prototype._onWriteComplete = function(writeInfo) {
  //this.log("bytesWritten = " + writeInfo.bytesWritten);
  if(writeInfo.bytesWritten > 0) {
    // write successfully
    if (this.callbacks.sent) {
      this.callbacks.sent();
    }
  } else if (writeInfo.bytesWritten == -15) {
    // socket is closed
    console.log('socket is closed');
    this.disconnect();
    this.callbacks.disconnect();
  } else {
    // other errors
  }
};


// used for only checking status
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.action && request.action == "status") {
    sendResponse({"result":true});
    return;
  }
});

var avaliblePorts = [];
chrome.runtime.onConnectExternal.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    switch(msg.action) {
      case 'connect':
        var onConnect = function() {
          port.postMessage({ action: "connected" });
        };
        var onDisconnect = function() {
          port.postMessage({action: "disconnected" });
          port.so = null;
        };
        var onReceive = function(str) {
          port.postMessage({action: "onReceive", data: str});
        };
        var so = new SocketClient({
            host: msg.host,
            port: msg.port,
            onConnect: onConnect,
            onDisconnect: onDisconnect,
            onReceive: onReceive,
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
              chrome.storage.sync.set(msg.data.values);
            if (msg.data && msg.data.logins)
              chrome.storage.local.set(msg.data.logins);
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
                var data = {
                  values: items,
                  logins: localItems
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
