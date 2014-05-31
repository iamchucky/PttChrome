document.addEventListener('DOMContentLoaded', function () {
  var site = getQueryVariable('site');
  if (site) {
    pttchrome.app = new pttchrome.App();
    window.onresize = function() {
      if (pttchrome.app) {
        pttchrome.app.view.fontResize();
      }
    };

    pttchrome.app.setInputAreaFocus();
    pttchrome.app.view.fontResize();
    pttchrome.app.connect(site);
  } else {
    console.log("empty site!");
  }
});

function msg(str) {
  return chrome.i18n.getMessage(str);
}
