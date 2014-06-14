$(document).ready(function() {
  setupI18n(function() {
    pttchrome.app = new pttchrome.App(function(app) {
      app.setInputAreaFocus();
      app.view.fontResize();
      app.connect('ptt.cc');
    });
  });
});

function setTimer(repeat, func, timelimit) {
  if(repeat) {
	  return {
		  timer: setInterval(func, timelimit),
		  cancel: function() {
			  clearInterval(this.timer);
		  }
	  }
  } else {
	  return {
		  timer: setTimeout(func, timelimit),
		  cancel: function() {
			  clearTimeout(this.timer);
		  }
	  }
  }
}

function openURI(uri, activate, postData) {
  chrome.tabs.create({
      url: uri,
      selected: activate
  }, function(tab) {
  });
}
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return null;
}

function dumpLog(type, string) {
	switch(type){
		case DUMP_TYPE_LOG: 	 console.log(string); break;
		case DUMP_TYPE_WARN: 	 console.warn(string); break;
		case DUMP_TYPE_ERROR: 	 console.error(string); break;
		default: console.log(string); break;
	}
}

var i18n_val = {};
function i18n(str) {
  return i18n_val[str];
}

function setupI18n(callback) {
  var lang = navigator.language || navigator.userLanguage;
  lang = lang.replace('-', '_');
  if (lang === '') {
    lang = 'en_US';
  }
  $.getJSON('/PttChrome/_locales/'+lang+'/messages.json', function(json) {
    i18n_val = json;
    callback();
  });
}
