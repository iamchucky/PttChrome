/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html?site=ptt.cc', {
  	id: "mainwin",
    bounds: {
      width: 880,
      height: 530
    },
    minWidth: 880,
    minHeight: 530,
  }, function(appWindow) {
    appWindow.onBoundsChanged.addListener(function() {
      var app = appWindow.contentWindow.pttchrome.app;
      if (app) {
        app.view.fontResize();
      }
    });
    appWindow.onClosed.addListener(function() {
      var so = appWindow.contentWindow.pttchrome.app.telnetCore.socket;
      if (so) {
        var id = so.socketId;
        if (id) {
          chrome.socket.disconnect(id);
        }
      }
    });
  });
});
