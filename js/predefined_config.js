var PREFS_CATEGORIES = ['general', 'mouseBrowsing', 'appearance'];
var DEFAULT_PREFS = {

  // general
  //closeQuery    : false,
  //dbcsDetect    : false,
  antiIdleTime  : 0,

  // mouse browsing
  useMouseBrowsing  : false,
  mouseBrowsingHighlight : true,

  // displays
  fontFace      : 'MingLiu,monospace',

};

// DUMP_TYPE
var DUMP_TYPE_LOG 	= 0;
var DUMP_TYPE_WARN 	= 1;
var DUMP_TYPE_ERROR = 2;

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

function i18n(str) {
  return chrome.i18n.getMessage(str);
}
