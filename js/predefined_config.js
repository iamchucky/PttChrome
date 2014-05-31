// COMMON
var SITE_NAME = 'sitename';
var USE_DEFAULT = 'usedefault';

// BOOL_TYPES
var H_ALIGN_CENTER 				= 'haligncenter';
var V_ALIGN_CENTER 				= 'valigncenter';
var DISPLAY_BORDER 				= 'displayborder';
var CLOSE_QUERY 				= 'closequery';
var USE_MOUSE_BROWSING 			= 'usemousebrowsing';
var USE_MOUSE_BROWSING_EX 		= 'usemousebrowsingex';
var MOUSE_BROWSING_SEND_ENTER 	= 'mousebrowsesendenter';
var MOUSE_BROWSING_HIGH_LIGHT 	= 'mousebrowsinghighlight';
var DBCS_DETECT					= 'dbcsdetect';
var MOUSE_BROWSING_HAND_POINTER	= 'mousebrowsinghandpointer';
var DETECT_LINK					= 'detectlink';
var HOKEY_FOR_SELECT_ALL		= 'hokeyforselectall';
var HOKEY_FR_MOUSE_BROWSING 	= 'hokeyfrmousebrowsing';
var HOKEY_FOR_BG_DISPLAY		= 'hokeyforbgdisplay';
var HOKEY_FOR_EASY_READING		= 'hokeyforeasyreading';
var HOKEY_FOR_DOWNLOAD_POST		= 'hokeyfordownloadpost';
var FONT_FIT_WINDOW_WIDTH		= 'fontfitwindowwidth';

// INT_TYPES
var BORDER_COLOR				= 'bordercolor';
var MOUSE_WHEEL_FUNC1			= 'mousewheelfunc1';
var MOUSE_WHEEL_FUNC2			= 'mousewheelfunc2';
var MOUSE_WHEEL_FUNC3			= 'mousewheelfunc3';
var HIGHLIGHT_BG				= 'highlightbg';
var MIDDLE_BTN_FUNCTION			= 'middlebuttonfunction';
var IDLE_TIME					= 'idletime';
var ENTER_TYPE					= 'entertype';
var BBS_SIZE					= 'bbssize';
var VIEW_WIDTH					= 'viewwidth';
var VIEW_HEIGHT					= 'viewheight';
var VIEW_FONT_SIZE				= 'viewfontsize';
var HOTKEY_CTRL_W				= 'hotkeyctrlw';
var HOTKEY_CTRL_L				= 'hotkeyctrll';
var HOTKEY_DOWNLOAD_TYPE		= 'hotkeydownloadtype';
var LINE_WRAP					= 'LineWrap';
var BG_BRIGHTNESS = 'backgroundbrightness';
var BG_TYPE = 'backgroundtype';

// COMP_TYPES
var FONT_FACE					= 'fontface';
var IDLE_STR					= 'idlestr';
var ESCAPE_STR					= 'escapestr';
var TERM_TYPE					= 'termtype';
var PRE_LOGIN_PROMPT			= 'preloginprompt';
var PRE_LOGIN					= 'prelogin';
var LOGIN_PROMPT				= 'loginprompt';
var LOGIN						= 'login';
var PASSWORD_PROMPT				= 'passwordprompt';
var PASSWORD					= 'passwd';
var POST_LOGIN					= 'postlogin';
var BG_DATA = 'backgrounddata';

var BOOL_TYPES = [H_ALIGN_CENTER, V_ALIGN_CENTER, DISPLAY_BORDER,
				 CLOSE_QUERY,USE_MOUSE_BROWSING,USE_MOUSE_BROWSING_EX,
				 MOUSE_BROWSING_SEND_ENTER,MOUSE_BROWSING_HIGH_LIGHT,
				 DBCS_DETECT,MOUSE_BROWSING_HAND_POINTER,DETECT_LINK,
				 HOKEY_FOR_SELECT_ALL,HOKEY_FR_MOUSE_BROWSING,HOKEY_FOR_BG_DISPLAY,
				 HOKEY_FOR_EASY_READING,HOKEY_FOR_DOWNLOAD_POST,
				 FONT_FIT_WINDOW_WIDTH];

var INT_TYPES = [BORDER_COLOR,MOUSE_WHEEL_FUNC1,MOUSE_WHEEL_FUNC2,
				 MOUSE_WHEEL_FUNC3,HIGHLIGHT_BG,MIDDLE_BTN_FUNCTION,
				 IDLE_TIME,ENTER_TYPE,BBS_SIZE,
				 VIEW_WIDTH,VIEW_HEIGHT,VIEW_FONT_SIZE,
				 HOTKEY_CTRL_W,HOTKEY_CTRL_L,HOTKEY_DOWNLOAD_TYPE, BG_TYPE, BG_BRIGHTNESS];

var COMP_TYPES = [FONT_FACE,IDLE_STR,ESCAPE_STR,TERM_TYPE,
				  PRE_LOGIN_PROMPT,PRE_LOGIN,LOGIN_PROMPT,
				  LOGIN,PASSWORD_PROMPT,PASSWORD,
				  POST_LOGIN, BG_DATA];

 /*
  BOOL_TYPES = ['ask','AutoDbcsDetection', H_ALIGN_CENTER,
                   V_ALIGN_CENTER,'LineFeed','LoadUrlInBG',
                   DETECT_LINK,USE_MOUSE_BROWSING,MOUSE_BROWSING_HIGH_LIGHT,
                   MOUSE_BROWSING_HAND_POINTER,USE_MOUSE_BROWSING_EX,MOUSE_BROWSING_SEND_ENTER,
                   'EPAutoPlay','EPLoop','EPAutoUseHQ',
                   'EPCopyUrlButton','EPWhenDropLink','HokeyForCopy',
                   'HokeyForPaste', HOKEY_FOR_SELECT_ALL,'HokeyForMouseBrowsing',
                   HOKEY_FOR_DOWNLOAD_POST,'UseKeyWordTrack','DeleteSpaceWhenCopy',
                   'EmbeddedPlayerMenu','MouseBrowseMenu','OpenAllLinkMenu',
                   'CopyHtmlMenu','ScreenKeyboardMenu','SavePageMenu',
                   'KeyWordTrackMenu','HideBookMarkLinkMenu','HideSendLinkMenu',
                   'HideBookMarkPageMenu','HideSendPageMenu','DelayPasteMenu',
                   'HideViewInfoMenu','UseHttpContextMenu','DownloadPostMenu',
                   'FileIoMenu','PreviewPictureMenu','NotifyWhenBackbround',
                   'NotifyBySound','NotifyByMessage','HideInputBuffer',
                   'DropToPaste','EnablePicturePreview','CtrlPicturePreview',
                   'PicturePreviewInfo','ClearCopiedSel',HOKEY_FOR_BG_DISPLAY,
                   'SwitchBgDisplayMenu','Hokey2ForPaste',DISPLAY_BORDER,
                   'EasyReadingMenu',HOKEY_FOR_EASY_READING,'SaveAfterDownload',
                   'EasyReadingWithImg','EasyReadingWithVideo','PushThreadMenu',
                   'NotifyShowContent'];
  */
  /*
  INT_TYPES = ['ScreenType',HIGHLIGHT_BG,'bbsbox.width',
                   'bbsbox.height',ENTER_TYPE,'FontSize',
                   'AntiIdle.seconds','FGBGcolor','LineWrap',
                   'ReconnectTime','EmbeddedPlayerSize',HOTKEY_CTRL_W,'HotkeyCtrlB',HOTKEY_CTRL_L,
                   'ScreenKeyboardAlpha','InputBufferSizeType','DefineInputBufferSize',
                   'PicturePreviewHeight','DownloadLineDelay',HOTKEY_DOWNLOAD_TYPE,
                   MIDDLE_BTN_FUNCTION,'BackgroundType','BackgroundBrightness',
                   MOUSE_WHEEL_FUNC1,MOUSE_WHEEL_FUNC2,MOUSE_WHEEL_FUNC3,
                   BORDER_COLOR,'PushThreadLineLength'];
  */
/*
  COMP_TYPES = ['AntiIdle.string','Escape.string',TERM_TYPE,
                   'Charset','FontFace.string',
                   'PreLoginPrompt','LoginPrompt','PasswdPrompt',
                   'PreLogin',
                   'PostLogin','BackgroundImageMD5'];
  */
var BBS_DEFAULT_SETTINGS = {
	'LineFeed' : true,
	'DropToPaste' : false,
	'LoadUrlInBG' : false,
	'ReconnectTime' : 0,
	'FGBGcolor' :  0,
	'Charset' : 'locale',
	'preloginprompt' : '',
	'loginprompt' : '',
	'passwordprompt' : '',
	'prelogin' : '',
	'postlogin' : '',
	'login' : '',
	'passwd' : '',
	'EmbeddedPlayerSize' :  0,
	'EPAutoPlay' : false,
	'EPLoop' : false,
	'EPAutoUseHQ' : false,
	'EPCopyUrlButton' : false,
	'EPWhenDropLink' :  true,
	'HotkeyCtrlB' :  1,
	'HokeyForCopy' :  true,
	'HokeyForPaste' :  true,
	'Hokey2ForPaste' :  false,
	'SavePageMenu' : true,
	'EmbeddedPlayerMenu' :  true,
	'PreviewPictureMenu' : false,
	'MouseBrowseMenu' : false,
	'SwitchBgDisplayMenu' : false,
	'OpenAllLinkMenu' :  false,
	'CopyHtmlMenu' : false,
	'ScreenKeyboardMenu' : true,
	'KeyWordTrackMenu' : false,
	'DelayPasteMenu' :  false,
	'EasyReadingMenu' : false,
	'DownloadPostMenu' :  false,
	'FileIoMenu' : false,
	'PushThreadMenu' :  false,
	'HideBookMarkLinkMenu' :  true,
	'HideSendLinkMenu' : true,
	'HideBookMarkPageMenu' :  true,
	'HideSendPageMenu' :  true,
	'HideViewInfoMenu' :  true,
	'ScreenKeyboardAlpha' :  15,
	'UseHttpContextMenu' :  true,
	'NotifyWhenBackbround' :  false,
	'NotifyBySound' : false,
	'NotifyByMessage' :  true,
	'NotifyShowContent' :  false,
	'HideInputBuffer' :  false,
	'InputBufferSizeType' :  1,
	'DefineInputBufferSize' :  12,
	'EnablePicturePreview' :  false,
	'CtrlPicturePreview' :  false,
	'PicturePreviewHeight' :  150,
	'PicturePreviewInfo' :  false,
	'SaveAfterDownload' :  true,
	'EasyReadingWithImg' :  false,
	'EasyReadingWithVideo' :  false,
	'UseKeyWordTrack' :  false,
	'DeleteSpaceWhenCopy' :  true,
	'DownloadLineDelay' :  600,
	'ClearCopiedSel' :  false,
	'BackgroundType' :  0,
	'BackgroundImageMD5' :  '',
	'BackgroundBrightness' :  50,
	'PushThreadLineLength' :  54,
	'FontFitWindowWidth' :  false
};

BBS_DEFAULT_SETTINGS[CLOSE_QUERY] = 0;
BBS_DEFAULT_SETTINGS[BBS_SIZE] = 0;
BBS_DEFAULT_SETTINGS[VIEW_WIDTH] = 960;
BBS_DEFAULT_SETTINGS[VIEW_HEIGHT] = 576;
BBS_DEFAULT_SETTINGS[H_ALIGN_CENTER] = "1";
BBS_DEFAULT_SETTINGS[V_ALIGN_CENTER] = "1";
BBS_DEFAULT_SETTINGS[ENTER_TYPE] = 0;
BBS_DEFAULT_SETTINGS[VIEW_FONT_SIZE] = 16;
BBS_DEFAULT_SETTINGS[FONT_FACE] = 'MingLiu,monospace';
BBS_DEFAULT_SETTINGS[IDLE_TIME] = 0;
BBS_DEFAULT_SETTINGS[IDLE_STR] = '^[[A^[[B';
BBS_DEFAULT_SETTINGS[ESCAPE_STR] = '^U';
BBS_DEFAULT_SETTINGS[TERM_TYPE] = 'VT100';
BBS_DEFAULT_SETTINGS[DBCS_DETECT] = '0';
BBS_DEFAULT_SETTINGS[MOUSE_WHEEL_FUNC1] = 0;
BBS_DEFAULT_SETTINGS[MOUSE_WHEEL_FUNC2] = 0;
BBS_DEFAULT_SETTINGS[MOUSE_WHEEL_FUNC3] = 0;
BBS_DEFAULT_SETTINGS[USE_MOUSE_BROWSING] = '0';
BBS_DEFAULT_SETTINGS[MOUSE_BROWSING_HIGH_LIGHT] = '1';
BBS_DEFAULT_SETTINGS[HIGHLIGHT_BG] = 2;
BBS_DEFAULT_SETTINGS[MOUSE_BROWSING_HAND_POINTER] = '1';
BBS_DEFAULT_SETTINGS[USE_MOUSE_BROWSING_EX] = '1';
BBS_DEFAULT_SETTINGS[DETECT_LINK] = '1';
BBS_DEFAULT_SETTINGS[HOTKEY_CTRL_W] = 1;
BBS_DEFAULT_SETTINGS[HOTKEY_CTRL_L] = 1;
BBS_DEFAULT_SETTINGS[HOKEY_FOR_SELECT_ALL] = '1';
BBS_DEFAULT_SETTINGS[HOKEY_FR_MOUSE_BROWSING] = '0';
BBS_DEFAULT_SETTINGS[HOKEY_FOR_BG_DISPLAY] = '0';
BBS_DEFAULT_SETTINGS[HOKEY_FOR_EASY_READING] = '0';
BBS_DEFAULT_SETTINGS[HOKEY_FOR_DOWNLOAD_POST] = '0';
BBS_DEFAULT_SETTINGS[MOUSE_BROWSING_SEND_ENTER] = '0';
BBS_DEFAULT_SETTINGS[MIDDLE_BTN_FUNCTION] = 0;
BBS_DEFAULT_SETTINGS[HOTKEY_DOWNLOAD_TYPE] = 0;
BBS_DEFAULT_SETTINGS[DISPLAY_BORDER] = '0';
BBS_DEFAULT_SETTINGS[BORDER_COLOR] = 15;
BBS_DEFAULT_SETTINGS[SITE_NAME] = "";
BBS_DEFAULT_SETTINGS[LINE_WRAP] = 0;
BBS_DEFAULT_SETTINGS[PRE_LOGIN_PROMPT] = "";
BBS_DEFAULT_SETTINGS[PRE_LOGIN] = "";
BBS_DEFAULT_SETTINGS[LOGIN_PROMPT] = "";
BBS_DEFAULT_SETTINGS[LOGIN] = "";
BBS_DEFAULT_SETTINGS[PASSWORD_PROMPT] = "";
BBS_DEFAULT_SETTINGS[PASSWORD] = "";
BBS_DEFAULT_SETTINGS[POST_LOGIN] = "";
BBS_DEFAULT_SETTINGS[BG_TYPE] = 0;
BBS_DEFAULT_SETTINGS[BG_BRIGHTNESS] = 50;
BBS_DEFAULT_SETTINGS[BG_DATA] = "";
BBS_DEFAULT_SETTINGS[FONT_FIT_WINDOW_WIDTH] = '0';

var BBS_VERSION_INFO = {
	'Version' :  '0.0.1',
	'option.SiteAddrList' :""
};
var DEFAULT_NAME = "default";
var SITES_LIST_NAME = "SITES_LIST_NAME";

// DUMP_TYPE
var DUMP_TYPE_LOG 	= 0;
var DUMP_TYPE_WARN 	= 1;
var DUMP_TYPE_ERROR = 2;


function GetNameKey(site, key) {
	return site + "." + key;
}
function GetSiteLocalStorage(site, key) {
  if (site == DEFAULT_NAME) {
    return BBS_DEFAULT_SETTINGS[key];
  }
	var name_key = GetNameKey(site, key);
	//dumpLog(DUMP_TYPE_LOG, "GetSiteLocalStorage -- " + name_key + " : " + localStorage[name_key]);
	return chrome.storage.local[name_key];
}
function SetSiteLocalStorage(site, key, value) {
	var name_key = GetNameKey(site, key);
	//dumpLog(DUMP_TYPE_LOG, "SetSiteLocalStorage -- " + name_key + " : " + value);
	chrome.storage.local[name_key] = value;
}

function GetLocalStorage(key) {
	//dumpLog(DUMP_TYPE_LOG, "GetLocalStorage -- " + key + " : " + localStorage[key]);
	return chrome.storage.local[key];
}
function SetLocalStorage(key, value) {
	//dumpLog(DUMP_TYPE_LOG, "SetLocalStorage -- " + key + " : " + value);
	chrome.storage.local[key] = value;
}

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
