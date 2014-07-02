var PREFS_CATEGORIES = ['mouseBrowsing', 'appearance'];
var PREFS_NAV = ['general', 'autologin' ];
var DEFAULT_PREFS = {

  // general
  //closeQuery    : false,
  //dbcsDetect    : false,
  openInPackagedApp : false,
  enablePicPreview  : true,
  antiIdleTime      : 0,
  lineWrap          : 78,

  // mouse browsing
  useMouseBrowsing            : false,
  mouseBrowsingHighlight      : true,
  mouseBrowsingHighlightColor : 2,
  mouseMiddleFunction         : 0,
  mouseWheelFunction1         : 1,
  mouseWheelFunction2         : 2,
  mouseWheelFunction3         : 3,

  // displays
  fontFitWindowWidth: false,
  fontFace          : 'SymMingLiu,MingLiu,monospace',
  bbsMargin         : 0,

};

var PREF_OPTIONS = {
  mouseMiddleFunction : [ 'options_none', 'options_enterKey', 'options_leftKey' ],
  mouseWheelFunction1 : [ 'options_none', 'options_upDown' , 'options_pageUpDown', 'options_threadLastNext' ],
  mouseWheelFunction2 : [ 'options_none', 'options_upDown' , 'options_pageUpDown', 'options_threadLastNext' ],
  mouseWheelFunction3 : [ 'options_none', 'options_upDown' , 'options_pageUpDown', 'options_threadLastNext' ],
}

// DUMP_TYPE
var DUMP_TYPE_LOG 	= 0;
var DUMP_TYPE_WARN 	= 1;
var DUMP_TYPE_ERROR = 2;

