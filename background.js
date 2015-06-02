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

// used for only checking status
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.action && request.action == "status") {
    return sendResponse({ result: true });
  }
});

// handler for messages passed between web app and the background
var messageHandler = {

  connect: function(port, msg) {
    var so = new SocketClient({
        host: msg.host,
        port: msg.port,
        setKeepAlive: parseInt(msg.keepAlive),

        onConnect: function() {
          port.postMessage({ action: "connected" });
        },

        onDisconnect: function() {
          port.postMessage({ action: "disconnected" });
          port.so = null;
        },

        onReceive: function(str) {
          port.postMessage({ action: "onReceive", data: str });
        },

        onSent: null
      });

    port.so = so;
    so.connect();
  },

  send: function(port, msg) {
    if(port.so && typeof(msg.data) == 'string') {
      var byteArray = new Uint8Array(msg.data.split('').map(function(x) { return x.charCodeAt(0); }));
      port.so.send(byteArray.buffer);
    }
  },

  disconnect: function(port, msg) {
    if (port.so) {
      port.so.disconnect();
      port.so = null;
    }
  },

  copy: function(port, msg) {
    if (!msg.data)
      return;
    if (!clipHelper) {
      createClipboardHelper(function() {
        doCopy(msg.data);
      });
    } else {
      doCopy(msg.data);
    }
  },

  paste: function(port, msg) {
    var result = doPaste();
    port.postMessage({ action: 'onPasteDone', data: result});
  },

  storage: function(port, msg) {
    var stype = msg.type;
    
    if (stype == 'set') {

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

    } else if (stype == 'get') {

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

    } else if (stype == 'clear') {

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
    }

  },

  newWindow: function(port, msg) {
    if (!msg.data)
      return;
    
    if (!clipHelper) {
      createClipboardHelper(function() {
        clipHelper.contentWindow.openWindow(msg.data);
      });
    } else {
      clipHelper.contentWindow.openWindow(msg.data);
    }
  },

  closeAppWindow: function(port, msg) {
    if (webview) {
      webview.closeWindow();
    }
  },

  getSymFont: function(port, msg) {
    port.postMessage({ action: 'onSymFont', data: symFontBase64 });
  }

};

chrome.runtime.onConnectExternal.addListener(function(port) {

  port.onMessage.addListener(function(msg) {
    if (messageHandler[msg.action]) {
      messageHandler[msg.action](port, msg);
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

