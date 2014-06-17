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
};

lib.Socket.prototype.connect = function() {
  chrome.socket.create('tcp', {}, this._onCreate.bind(this));
};

lib.Socket.prototype.send = function(arrayBuffer) {
  chrome.socket.write(this.socketId, arrayBuffer, this._onWriteComplete.bind(this));
};

lib.Socket.prototype.disconnect = function() {
  chrome.socket.disconnect(this.socketId);
  chrome.socket.destroy(this.socketId);
  this.isConnected = false;
};

lib.Socket.prototype._onCreate = function(createInfo) {
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

lib.Socket.prototype._onConnectComplete = function(resultCode) {
  // Start polling for reads.
  this._periodicallyRead();
  if (this.callbacks.connect) {
    //console.log('connect complete');
    this.callbacks.connect(this.tabid);
  } else {
  }
  //log('onConnectComplete');
};

lib.Socket.prototype._periodicallyRead = function() {
  chrome.socket.read(this.socketId, this._onDataRead.bind(this));
};

lib.Socket.prototype._onDataRead = function(readInfo) {
  // Call received callback if there's data in the response.
  if (readInfo.resultCode > 0 && this.callbacks.recv) {
    var str = String.fromCharCode.apply(null, new Uint8Array(readInfo.data));
    this.callbacks.recv(str);
    setTimeout(this._periodicallyRead.bind(this), 10);
  } else if (readInfo.resultCode == -15) {
    //socket is closed
    console.log('socket is closed');
    this.disconnect();
    this.callbacks.disconnect();
  } else {
    // other errors
  }
};

lib.Socket.prototype._onWriteComplete = function(writeInfo) {
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
