// COMMON
var SITE_NAME   = 'sitename';
var USE_DEFAULT = 'usedefault';

// BOOL_TYPES
var USE_MOUSE_BROWSING 	  = 'usemousebrowsing';

// INT_TYPES
var MOUSE_WHEEL_FUNC1			= 'mousewheelfunc1';
var MOUSE_WHEEL_FUNC2			= 'mousewheelfunc2';
var MOUSE_WHEEL_FUNC3			= 'mousewheelfunc3';

var DEFAULT_PREFS = {

  CLOSE_QUERY     : false,

  // displays
  BBS_SIZE        : 0,
  VIEW_WIDTH      : 960,
  VIEW_HEIGHT     : 576,
  H_ALIGN_CENTER  : true,
  V_ALIGN_CENTER  : true,
  ENTER_TYPE      : 0,
  VIEW_FONT_SIZE  : 16,
  FONT_FACE       : 'MingLiu,monospace',
  IDLE_TIME       : 0,
  IDLE_STR        : '^[[A^[[B',
  ESCAPE_STR      : '^U',
  TERM_TYPE       : 'VT100',
  DBCS_DETECT     : false,
  DETECT_LINK     : true,
  DISPLAY_BORDER  : false,
  BORDER_COLOR    : 15,
  SITE_NAME       : '',
  LINE_WRAP       : 0,
  BG_TYPE         : 0,
  BG_BRIGHTNESS   : 50,
  BG_DATA         : '',
  FONT_FIT_WINDOW_WIDTH : false,

  // mouse browsing
  MOUSE_WHEEL_FUNC1 : 0,
  MOUSE_WHEEL_FUNC2 : 0,
  MOUSE_WHEEL_FUNC3 : 0,
  USE_MOUSE_BROWSING  : false,
  MOUSE_BROWSING_HIGHLIGHT : true,
  HIGHLIGHT_BG    : 2,
  MOUSE_BROWSING_HANDPOINTER : true,
  USE_MOUSE_BROWSING_EX : true,
  MOUSE_BROWSING_SEND_ENTER : false,
  MIDDLE_BTN_FUNCTION : 0,

  // hotkeys
  HOTKEY_CTRL_W   : 1,
  HOTKEY_CTRL_L   : 1,
  HOTKEY_FOR_SELECT_ALL : true,
  HOTKEY_FOR_MOUSE_BROWSING : false,
  HOTKEY_FOR_BG_DISPLAY : false,
  HOTKEY_FOR_EASY_READING : false,
  HOTKEY_FOR_DOWNLOAD_POST : false,
  HOTKEY_DOWNLOAD_TYPE : 0,

  // logins
  PRE_LOGIN_PROMPT : '',
  PRE_LOGIN       : '',
  LOGIN_PROMPT    : '',
  LOGIN           : '',
  PASSWORD_PROMPT : '',
  PASSWORD        : '',
  POST_LOGIN      : ''

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
