/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */

chrome.app.runtime.onLaunched.addListener(function() {
  window.open('http://iamchucky.github.io/PttChrome/');
});

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
///
//
var loadFileEntry = function (_chosenEntry, readcb) {
  var chosenEntry = _chosenEntry;
    chosenEntry.file(function(file) {
      var reader = new FileReader();
      reader.onerror = function(e) {
      };
      reader.onload = function(e) {
        readcb(reader.result);
      };
      reader.readAsDataURL(file);
    });
};

// used for only checking status
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.action && request.action == "status") {
    sendResponse({"result":true});
    return;
  }
});

chrome.runtime.onConnectExternal.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    if (msg.action == "connect") {
      var onConnect = function() {
        port.postMessage({ action: "connected" });
      };
      var onDisconnect = function() {
        port.postMessage({action: "disconnected" });
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
    } else if (msg.action =="send") {
      if(port.so && typeof(msg.data) == 'string') {
        var byteArray = new Uint8Array(msg.data.split('').map(function(x){return x.charCodeAt(0);}));
        port.so.send(byteArray.buffer);
      }
    } else if(msg.action =="disconnect") {
      if (port.so) {
        port.so.disconnect();
        port.so = null;
      }
    } else if(msg.action =="readFile") {
      //pop up a open file dialog
      //after user select a file, conv to base 64 and send a string message back;
      var accepts = [{
        //mimeTypes: ['text/*'],
        extensions: ['jpg', 'jpeg', 'gif', 'png']
      }];
      chrome.fileSystem.chooseEntry({type: 'openFile', accepts: accepts}, function(theEntry) {
        if (!theEntry) {
          port.postMessage({action: "onFileDataReady", data: ""});            
        } else {
          // use local storage to retain access to this file
          chrome.storage.local.set({'chosenFile': chrome.fileSystem.retainEntry(theEntry)});
          var readcb = function(str) {
            port.postMessage({action: "onFileDataReady", data: str});
          }
          loadFileEntry(theEntry, readcb);
        }
      });
    }
  });
  port.onDisconnect.addListener(function(msg) {
    if (port.so) {
      port.so.disconnect();
      port.so = null;
    }
  });
});
