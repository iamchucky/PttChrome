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
  chrome.socket.create('tcp', {}, function(createInfo) {
    // onCreate

    self.socketId = createInfo.socketId;
    if (self.socketId > 0) {

      chrome.socket.connect(self.socketId, self.host, self.port, function(resultCode) {
        if (resultCode < 0) {
          if (self.callbacks.disconnect) {
            self.callbacks.disconnect();
          }
          chrome.socket.destroy(self.socketId);
          return console.log('socket connect error');
        }

        // onConnectComplete
        // set keepalive with 5 mins delay
        if (self.enableKeepAlive) {

          chrome.socket.setKeepAlive(self.socketId, self.enableKeepAlive, self.setKeepAlive, function(result) {
            console.log('set keepalive with '+self.setKeepAlive+' sec delay');

            if (result < 0) {
              // still connect without keepalive
              console.log('socket set keepalive error');
            }

            chrome.socket.read(self.socketId, self._onDataRead.bind(self));
            if (self.callbacks.connect) {
              //console.log('connect complete');
              self.callbacks.connect();
            }
          });

        } else {

          // skip set keepalive completely if not enabling
          chrome.socket.read(self.socketId, self._onDataRead.bind(self));
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
  chrome.socket.write(this.socketId, arrayBuffer, function(writeInfo) {
    if(writeInfo.bytesWritten > 0) {
      // write successfully
      if (self.callbacks.sent) {
        self.callbacks.sent();
      }
    } else if (writeInfo.bytesWritten == -15) {
      // socket is closed
      console.log('socket '+self.socketId+' is closed');
      self.disconnect();
      self.callbacks.disconnect();
    } else {
      // other errors
      console.log('socket '+self.socketId+' reports resultCode '+sendInfo.resultCode);
    }
  });
};

SocketClient.prototype.disconnect = function() {
  chrome.socket.disconnect(this.socketId);
  chrome.socket.destroy(this.socketId);
};

SocketClient.prototype._onDataRead = function(readInfo) {
  var msecBetweenReads = 10;
  if (!this.callbacks.recv) return;

  // Call received callback if there's data in the response.
  var str = String.fromCharCode.apply(null, new Uint8Array());
  this.callbacks.recv(str);

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
    console.log('socket '+this.socketId+' is closed');
    this.disconnect();
    this.callbacks.disconnect();
  } else {
    console.log('socket returned code '+readInfo.resultCode);
  }
};

