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
      height: 480
    }
  }, function(appWindow) {
    appWindow.onClosed.addListener(function() {
      var id = appWindow.contentWindow.pttchrome.app.telnetCore.socket.socketId;
      if (id) {
        chrome.socket.disconnect(id);
      }
    });
  });
});
