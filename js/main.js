$(document).ready(function() {
  var site = getQueryVariable('site');
  var from = getQueryVariable('from');
  var keepAlive = getQueryVariable('keepAlive');
  setupI18n();
  if (typeof(chrome) == 'undefined') {
    // don't seem to be using chrome, show msg
    $('#getAppBtn').off();
    $('#getAppBtn').click(function() {
      window.open('https://chrome.google.com/webstore/detail/pttchrome/hhnlfapopmaimdlldbknjdgekpgffmbo', '_self');
    });
    console.log('app is not running or installed');
    $('#getAppBtn').text(i18n('getAppBtn'));
    for (var i = 1; i < 5; ++i) {
      $('#alreadyInstalledHint'+i).text(i18n('alreadyInstalledHint'+i));
    }
    $('#welcomeJumbo').show();
    return;
  }

  pttchrome.app = new pttchrome.App(function(app) {
    app.setInputAreaFocus();
    if (!site) {
      site = 'ptt.cc';
    }
    app.connect(site);
    $('#BBSWindow').show();
    //$('#sideMenus').show();
    app.onWindowResize();
  }, { from: from, keepAlive: keepAlive, ssh: !site || site === 'ptt.cc' });
  // calls the gapi onload
  handleGapiClientLoad();
});

/**
  * Called when the client library is loaded.
  */
function handleGapiClientLoad() {
  $('#blacklist_driveLoading').css('display', '');
  window.setTimeout(pttchrome.app.pref.gdrive.checkAuth.bind(pttchrome.app.pref.gdrive), 1);
}

function setTimer(repeat, func, timelimit) {
  if(repeat) {
	  return {
		  timer: setInterval(func, timelimit),
		  cancel: function() {
			  clearInterval(this.timer);
		  }
	  };
  } else {
	  return {
		  timer: setTimeout(func, timelimit),
		  cancel: function() {
			  clearTimeout(this.timer);
		  }
	  };
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

