var socketOnRead = {};
var socketOnReadError = {};

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


function SocketClient(spec) {
  this.host = spec.host;
  this.port = spec.port;
  if (spec.setKeepAlive) {
    this.setKeepAlive = spec.setKeepAlive;
  } else {
    this.setKeepAlive = 0;
  }
  this.enableKeepAlive = (spec.setKeepAlive !== undefined && spec.setKeepAlive !== 0 && !isNaN(spec.setKeepAlive));

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
          if (self.callbacks.disconnect) {
            self.callbacks.disconnect();
          }
          chrome.sockets.tcp.close(self.socketId);
          return console.log('socket connect error');
        }

        // onConnectComplete
        // set keepalive with 5 mins delay
        if (self.enableKeepAlive) {

          chrome.sockets.tcp.setKeepAlive(self.socketId, self.enableKeepAlive, self.setKeepAlive, function(result) {
            console.log('set keepalive with '+self.setKeepAlive+' sec delay');

            if (result < 0) {
              // still connect without keepalive
              console.log('socket set keepalive error');
            }

            socketOnRead[self.socketId] = self._onDataRead.bind(self);
            socketOnReadError[self.socketId] = self._onDataReadError.bind(self);
            if (self.callbacks.connect) {
              //console.log('connect complete');
              self.callbacks.connect();
            }
          });

        } else {

          // skip set keepalive completely if not enabling
          socketOnRead[self.socketId] = self._onDataRead.bind(self);
          socketOnReadError[self.socketId] = self._onDataReadError.bind(self);
          if (self.callbacks.connect) {
            //console.log('connect complete');
            self.callbacks.connect();
          }

        }

      });
    } else {
      //error('Unable to create socket');
    }
  });
};

SocketClient.prototype.send = function(arrayBuffer) {
  var self = this;
  chrome.sockets.tcp.send(this.socketId, arrayBuffer, function(sendInfo) {
    if (sendInfo.resultCode == 0) {
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
    chrome.sockets.tcp.close(self.socketId, function() {
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

