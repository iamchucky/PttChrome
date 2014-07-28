function SecureShellConnection(app) {
  this.app = app;

  this.host = 'ptt.cc';
  this.port = 22;
  this.login = 'bbs';
  this.password = '';

  this.privatekey = '';
  this.width = 80;
  this.height = 24;

  // internal variables
  this.transport = null;
  this.client = null;
  this.shell = null;

  // read-only variables
  this.socket = chrome.socket;
  this.isConnected = false;         // are we connected?

  this.outBuffer = '';

  this.keepAliveMode = true;
  setTimeout(this.keepAlive.bind(this), 60000);

  this.EscChar = '\x15'; // Ctrl-U
  this.termType = 'VT100';
  this.lineWrap = 78;

  //AutoLogin - start
  this.autoLoginStage = 0;
  this.loginPrompt = ['','',''];
  this.loginStr = ['','','',''];
  //AutoLogin - end
}

SecureShellConnection.prototype.disconnect = function() {
  this.isConnected = false;
  this.client.close(true);
  if (this.app.appConn && this.app.appConn.isConnected) {
    this.app.appConn.disconnect();
    this.app.onClose();
  }
  this.shell = null;
};

SecureShellConnection.prototype.connect = function(host, port) {
  if (host) {
    this.host = host;
  }

  // Check AutoLogin Stage
  //this.app.loadLoginData(); //load login data
  if(this.loginStr[1])
    this.autoLoginStage = this.loginStr[0] ? 1 : 2;
  else if(this.loginStr[2])
    this.autoLoginStage = 3;
  else
    this.autoLoginStage = 0;

  //this.initialAutoLogin();
  this.isConnected = false;

  var self = this;
  var shell_success = function(shell) {
    self.shell = shell;
  };

  this.client = new paramikojs.SSHClient();
  this.client.set_missing_host_key_policy(new paramikojs.AutoAddPolicy());
  this.client.load_host_keys('known_hosts');

  var auth_success = function() {
    self.client.invoke_shell('xterm-256color', self.width, self.height, shell_success);
  };

  var write = function(str) {
    if (str) {
      if (self.app && self.app.appConn) {
        self.app.idleTime = 0;
        self.app.appConn.sendTcp(str);
      }
    }
  };

  this.transport = this.client.connect(
      write, auth_success, this.host, this.port, 
      this.login, this.password, null, this.privatekey);

  this.app.appConn.connectTcp(this.host, this.port);
};

SecureShellConnection.prototype.onDataAvailable = function(str) {
  try {
    this.transport.fullBuffer += str;  // read data
    this.transport.run();
  } catch(ex) {
    console.log(ex);

    if (ex instanceof paramikojs.ssh_exception.AuthenticationException) {
      this.client.legitClose = true;
      return;
    }
  }

  try {
    if (!this.shell) {
      return;
    }
    if (this.shell.closed) {
      this.disconnect();
      return;
    }
    var data = this.shell.recv(65536);
  } catch(ex) {
    if (ex instanceof paramikojs.ssh_exception.WaitException) {
      // some times no data comes out, dont care
      return;
    } else {
      throw ex;
    }
  }
  if (data) {
    this.app.onData(data);
  }
};

SecureShellConnection.prototype.keepAlive = function() {
  if (this.isConnected && this.keepAliveMode) {
    this.client._transport.global_request('keepalive@lag.net', null, false);
  }

  setTimeout(this.keepAlive.bind(this), 60000);
};

// from cli to paramikojs
SecureShellConnection.prototype.send = function(str) {
  this.shell.send(str);
};

SecureShellConnection.prototype.convSend = function(unicode_str) {
  // supports UAO
  // when converting unicode to big5, use UAO.

  var s = unicode_str.u2b();
  // detect ;50m (half color) and then convert accordingly
  if (s) {
    s = s.ansiHalfColorConv();
    this.send(s);
  }
};

SecureShellConnection.prototype.checkAutoLogin = function(row) {
  if (this.autoLoginStage > 3 || this.autoLoginStage < 1) {
    this.autoLoginStage = 0;
    return;
  }

  var line = this.app.buf.getRowText(row, 0, this.app.buf.cols);
  if (line.indexOf(this.loginPrompt[this.autoLoginStage - 1]) < 0)
    return;

  if (this.host == 'ptt.cc') {
    var unicode_str = this.loginStr[this.autoLoginStage-1] + this.app.view.EnterChar;
    this.convSend(unicode_str);
  }

  if (this.autoLoginStage == 3) {
    if (this.loginStr[3] && this.host == 'ptt.cc')
      this.convSend(this.loginStr[3]);
    this.autoLoginStage = 0;
    return;
  }
  ++this.autoLoginStage;
};
