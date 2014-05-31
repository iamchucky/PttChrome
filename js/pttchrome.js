// Main Program

var pttchrome = {};

pttchrome.App = function() {

  this.CmdHandler = document.getElementById('cmdHandler');
  this.CmdHandler.setAttribute(USE_MOUSE_BROWSING, '1');
  this.CmdHandler.setAttribute('doDOMMouseScroll', '0');
  //this.CmdHandler.setAttribute('useMouseUpDown', '0');
  //this.CmdHandler.setAttribute('useMouseSwitchPage', '0');
  //this.CmdHandler.setAttribute("useMouseReadThread", '0');
  this.CmdHandler.setAttribute(MOUSE_WHEEL_FUNC1, '1');
  this.CmdHandler.setAttribute(MOUSE_WHEEL_FUNC2, '2');
  this.CmdHandler.setAttribute(MOUSE_WHEEL_FUNC3, '0');
  this.CmdHandler.setAttribute('useTextDragAndDrop', '0');
  this.CmdHandler.setAttribute("HokeyForMouseBrowsing", '0');
  this.CmdHandler.setAttribute("EnableBackground", '1');
  this.CmdHandler.setAttribute('webContextMenu', '1');
  this.CmdHandler.setAttribute('SavePageMenu', '1');
  this.CmdHandler.setAttribute('EmbeddedPlayerMenu', '1');
  this.CmdHandler.setAttribute('PreviewPictureMenu', '0');
  this.CmdHandler.setAttribute('EasyReadingMenu', '0');
  this.CmdHandler.setAttribute('PushThreadMenu', '0');
  this.CmdHandler.setAttribute('OpenAllLinkMenu', '0');
  this.CmdHandler.setAttribute("MouseBrowseMenu", '0');
  this.CmdHandler.setAttribute("SwitchBgDisplayMenu", '0');
  this.CmdHandler.setAttribute('FileIoMenu', '0');
  this.CmdHandler.setAttribute('DownloadPostMenu', '0');
  this.CmdHandler.setAttribute('ScreenKeyboardMenu', '1');
  this.CmdHandler.setAttribute('ScreenKeyboardOpened', '0');
  this.CmdHandler.setAttribute('DragingWindow', '0');
  this.CmdHandler.setAttribute('MaxZIndex', 11);
  this.CmdHandler.setAttribute('allowDrag','0');
  this.CmdHandler.setAttribute('haveLink','0');
  //this.CmdHandler.setAttribute('onLink','0');
  //this.CmdHandler.setAttribute('onPicLink','0');
  this.CmdHandler.setAttribute('mouseOnPicWindow','0');
  this.CmdHandler.setAttribute('draging','0');
  this.CmdHandler.setAttribute('textSelected','0');
  this.CmdHandler.setAttribute('dragType','');
  this.CmdHandler.setAttribute('LastPicAddr', '0');
  this.CmdHandler.setAttribute('isMouseRightBtnDrag','0');

  this.CmdHandler.setAttribute('hideBookMarkLink','1');
  this.CmdHandler.setAttribute('hideSendLink','1');
  this.CmdHandler.setAttribute('hideBookMarkPage','1');
  this.CmdHandler.setAttribute('hideSendPage','1');
  this.CmdHandler.setAttribute('hideViewInfo','1');
  this.CmdHandler.setAttribute('SkipMouseClick','0');
  this.pref = null;

  this.telnetCore = new TelnetCore(this);
  this.view = new TermView(24);
  this.buf = new TermBuf(80, 24);
  this.buf.setView(this.view);
  //this.buf.severNotifyStr=this.getLM('messageNotify');
  //this.buf.PTTZSTR1=this.getLM('PTTZArea1');
  //this.buf.PTTZSTR2=this.getLM('PTTZArea2');
  this.view.setBuf(this.buf);
  this.view.setConn(this.telnetCore);
  this.view.setCore(this);
  this.parser = new lib.AnsiParser(this.buf);
  /*
  var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
  this.FXVersion = parseFloat(appInfo.version);
  //new pref - start
  this.prefListener=null;
  this.isDefaultPref=true;
  */
  this.antiIdleStr = '';
  this.antiIdleTime = 0;
  this.deleteSpaceWhenCopy = true;
  this.loadURLInBG = false;
  this.clearCopiedSel = true;
  //new pref - end
  this.unusedTime = 0;
  this.connectTime = 0;
  this.connectState = 0;

  this.DocInputArea = document.getElementById('t');
  this.BBSWin = document.getElementById('BBSWindow');
  this.BBSBg = document.getElementById('BBSBackgroundImage');
  /*
  this.btnCloseSymbolInput = document.getElementById('btnCloseSymbolInput');

  this.mouseLeftButtonDown = false;
  //this.mouseRightButtonDown = false;
  */
  this.DelayPasteBuffer = '';
  this.DelayPasteIndex = -1;
  this.DelayPasteNotify = true;

  this.LastMouseDownX = 0;
  this.LastMouseDownY = 0;
  //this.CanExecMouseDown = true;
  this.DragText = false;

  this.focusTimer = null;
  this.tabUpdateTimer = null;
  this.settingCheckTimer = null;
  this.inputAreaFocusTimer = null;
  //this.xmlhttp = null;
  //this.doDOMMouseScroll = false;
  this.post_text = new Array();
  this.post_html = new Array();
  this.tempFiles = [];
  this.downpostcounter = null;
  this.alertBeforeUnload = false;
  this.pushThreadLineLength = 70;
  this.pushTextTemp = '';

  /*
  this.tab_Select = {
      view: this,
      handleEvent: function(e) {
          this.view.focusTab(e);
      }
  };
  this.gBrowser.tabContainer.addEventListener("TabSelect", this.tab_Select, false);

  this.tab_AttrModified = {
      view: this,
      handleEvent: function(e) {
          this.view.tabAttrModified(e);
      }
  };
  if(this.FXVersion >= 4.0) //for firefox 4
    this.gBrowser.tabContainer.addEventListener("TabAttrModified", this.tab_AttrModified, false);
  */
  var cmd_Listener = {
    app: this,
    handleEvent: function(e) {
      this.app.overlayCommandListener(e);
    }
  };
  this.CmdHandler.addEventListener("OverlayCommand", cmd_Listener, false);

  var mouseclick = {
    app: this,
    handleEvent: function(e) {
      this.app.mouse_click(e);
    }
  };
  window.addEventListener('click', mouseclick, false);

  var mousedowninit = {
    app: this,
    handleEvent: function(e) {
      this.app.mouse_down_init(e);
    }
  };
  window.addEventListener('mousedown', mousedowninit, true);

  var mousedown = {
    app: this,
    handleEvent: function(e) {
      this.app.mouse_down(e);
    }
  };
  window.addEventListener('mousedown', mousedown, false);

  var mouseup = {
    app: this,
    handleEvent: function(e) {
      this.app.mouse_up(e);
    }
  };
  window.addEventListener('mouseup', mouseup, false);

  var mousemove = {
    app: this,
    handleEvent: function(e) {
      this.app.mouse_move(e);
    }
  };
  document.addEventListener('mousemove', mousemove, false);

  var mouseover = {
    app: this,
    handleEvent: function(e) {
      this.app.mouse_over(e);
    }
  };
  document.addEventListener('mouseover', mouseover, false);

  var mousescroll = {
    app: this,
    handleEvent: function(e) {
      this.app.mouse_scroll(e);
    }
  };
  addEventListener('mousewheel', mousescroll, true);

  this.menuHandler = {};
  chrome.contextMenus.onClicked.addListener(function(onClickData, tab) {
    pttchrome.app.menuHandler[onClickData.menuItemId]();
  });

  var contextmenu = {
    app: this,
    handleEvent: function(e) {
      this.app.context_menu(e);
    }
  };
  window.addEventListener('contextmenu', contextmenu, false);

  /*
  var mousedragstart = {
    view: this,
    handleEvent: function(e) {
      this.view.DragText=true;
    }
  };
  document.addEventListener ('dragstart', mousedragstart, false);

  var mousedragover = {
    view: this,
    handleEvent: function(e) {
      this.view.mouse_dragover(e);
    }
  };
  document.addEventListener ('dragover', mousedragover, false);

  var mousedrop = {
    view: this,
    handleEvent: function(e) {
      this.view.mouse_dragdrop(e);
    }
  };
  document.addEventListener ('drop', mousedrop, false);

  var mousedragend = {
    view: this,
    handleEvent: function(e) {
      this.view.DragText=false;
    }
  };
  document.addEventListener ('dragend', mousedragend, false);
  */
  var keypress = {
    app: this,
    handleEvent: function(e) {
      this.app.key_press(e);
    }
  };
  //window.addEventListener('keypress', keypress, true);
  //window.addEventListener('keydown', keypress, true);

  this.view.fontResize();
  this.dblclickTimer=null;
  this.mouseDownTimer=null;
  this.mbTimer=null;

  /*
  window.controllers.insertControllerAt(0, this.documentControllers);            // to override default commands for window
  this.DocInputArea.controllers.insertControllerAt(0, this.documentControllers); // to override default commands for inputbox
  */
};

pttchrome.App.prototype.reloadSetting = function() {
  this.pref.reloadSetting();
};

pttchrome.App.prototype.connect = function(url) {
  dumpLog(DUMP_TYPE_LOG, "connect to " + url);
  this.pref = new PttChromePref(this, url);
  document.title = this.pref.sitename;
  var splits = url.split(/:/g);
  var port = 23;
  if(splits.length == 1)
  {
  }
  else if(splits.length == 2)
  {
    url = splits[0];
    port = splits[1];
  }
  this.telnetCore.connect(url, port);
};

pttchrome.App.prototype.close = function() {
  this.telnetCore.listener = null;
  this.telnetCore.close();

  this.view.blinkTimeout.cancel();

  this.cancelMouseDownTimer();
  this.cancelMbTimer();
};

pttchrome.App.prototype.onConnect = function() {
  dumpLog(DUMP_TYPE_LOG, "pttchrome onConnect");
  this.connectState = 1;
  this.updateTabIcon('connect');
  this.unusedTime = 0;
  var _this = this;
  this.timerOnsec = setTimer(true, function() {
    _this.antiIdle();
  }, 1000);
};

pttchrome.App.prototype.onData = function(data) {
//dumpLog(DUMP_TYPE_LOG, "pttchrome onData");
  this.parser.feed(data);
};

pttchrome.App.prototype.onClose = function() {
  dumpLog(DUMP_TYPE_LOG, "pttchrome onClose");
  this.unregExitAlert();

  this.connectState = 2;
  this.unusedTime = 0;

  this.updateTabIcon('disconnect');
  this.timerOnsec.cancel();
};

pttchrome.App.prototype.resetUnusedTime = function() {
  this.unusedTime = 0;
};

pttchrome.App.prototype.sendData = function(str) {
  if (this.connectState == 1)
    this.telnetCore.convSend(str, this.view.charset);
};

pttchrome.App.prototype.sendCmdData = function(str) {
  if (this.connectState == 1)
    this.telnetCore.send(str);
};

pttchrome.App.prototype.cancelMbTimer = function() {
  if (this.mbTimer) {
    this.mbTimer.cancel();
    this.mbTimer = null;
  }
};

pttchrome.App.prototype.setMbTimer = function() {
  this.cancelMbTimer();
  var _this = this;
  this.mbTimer = setTimer(false, function() {
    _this.mbTimer.cancel();
    _this.mbTimer = null;
    _this.CmdHandler.setAttribute('SkipMouseClick', '0');
  }, 100);
};

pttchrome.App.prototype.cancelDblclickTimer = function() {
  if (this.dblclickTimer) {
    this.dblclickTimer.cancel();
    this.dblclickTimer = null;
  }
};

pttchrome.App.prototype.setDblclickTimer = function() {
  this.cancelDblclickTimer();
  var _this = this;
  this.dblclickTimer = setTimer(false, function() {
    _this.dblclickTimer.cancel();
    _this.dblclickTimer = null;
  }, 350);
};

pttchrome.App.prototype.cancelMouseDownTimer = function() {
  if(this.mouseDownTimer) {
    this.mouseDownTimer.cancel();
    this.mouseDownTimer = null;
  }
};

pttchrome.App.prototype.setInputAreaFocus = function() {
  //this.DocInputArea.disabled="";
  this.DocInputArea.focus();
};

pttchrome.App.prototype.doPaste = function() {
  this.pasting = true;
  this.setInputAreaFocus();
  document.execCommand("paste", false, null);
  this.pasting = false;
};

pttchrome.App.prototype.doSelectAll = function() {
  //var allspans = document.getElementById("main");
  window.getSelection().selectAllChildren(this.view.mainDisplay);
};

pttchrome.App.prototype.switchMouseBrowsing = function() {
  if (this.CmdHandler.getAttribute(USE_MOUSE_BROWSING)=='1') {
    this.CmdHandler.setAttribute(USE_MOUSE_BROWSING, '0');
    this.buf.useMouseBrowsing=false;
  } else {
    this.CmdHandler.setAttribute(USE_MOUSE_BROWSING, '1');
    this.buf.useMouseBrowsing=true;
  }

  if (!this.buf.useMouseBrowsing) {
    this.buf.BBSWin.style.cursor = 'auto';
    this.buf.clearHighlight();
    this.buf.mouseCursor=0;
    this.buf.nowHighlight=-1;
    this.buf.tempMouseCol=0;
    this.buf.tempMouseRow=0;
  } else {
    this.buf.SetPageState();
    this.buf.resetMousePos();
    this.view.redraw(true);
    this.view.updateCursorPos();
  }
  //this.view.showAlertMessage(document.title, this.buf.useMouseBrowsing?this.getLM('mouseBrowseOn'):this.getLM('mouseBrowseOff'));
};

pttchrome.App.prototype.antiIdle = function() {
  if (this.antiIdleTime && this.unusedTime > this.antiIdleTime) {
    if (this.antiIdleStr!='' && this.connectState==1)
      this.telnetCore.send(this.antiIdleStr);
  } else {
    if (this.connectState==1)
      this.unusedTime+=1000;
  }

  if (this.DelayPasteBuffer != '' && this.DelayPasteIndex!=-1 
      && this.DelayPasteIndex < this.DelayPasteBuffer.length ) {

    var s = this.DelayPasteBuffer.substr(this.DelayPasteIndex, 1);
    this.DelayPasteIndex++;
    this.sendData(s);
    if (this.DelayPasteIndex == this.DelayPasteBuffer.length) {
      this.DelayPasteBuffer = '';
      this.DelayPasteIndex = -1;
      if (this.DelayPasteNotify)
        this.view.showAlertMessage(document.title, this.getLM('delayPasteFinish'));
    }
  }
};

pttchrome.App.prototype.updateTabIcon = function(aStatus) {
  var icon = 'icon/logo.png';
  switch (aStatus) {
    case 'connect':
      icon =  'icon/connect.png';
      this.setInputAreaFocus();
      break;
    case 'disconnect':
  dumpLog(DUMP_TYPE_LOG, "icon/disconnect.png");
      icon =  'icon/disconnect.png';
      break;
    case 'newmessage':  // Not used yet
      icon =  'icon/connect.png';
      break;
    case 'connecting':  // Not used yet
      icon =  'icon/connecting.gif';
    default:
  }

  var link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "icon");
    link.setAttribute("href", icon);
    document.head.appendChild(link);
  } else {
    link.setAttribute("href", icon);
  }
};

pttchrome.App.prototype.clientToPos = function(cX, cY) {
  var x;
  if (this.view.horizontalAlignCenter && this.view.scaleX != 1)
    x = cX - ((document.documentElement.clientWidth - (this.view.chw * this.buf.cols) * this.view.scaleX) / 2);
  else
    x = cX - parseFloat(this.view.firstGrid.offsetLeft);
  var y = cY - parseFloat(this.view.firstGrid.offsetTop);
  var col = Math.floor(x / (this.view.chw * this.view.scaleX));
  var row = Math.floor(y / this.view.chh);

  if (row < 0)
    row = 0;
  else if (row >= this.buf.rows-1)
    row = this.buf.rows-1;

  if (col < 0)
    col = 0;
  else if (col >= this.buf.cols-1)
    col = this.buf.cols-1;

  return {col: col, row: row};
};

pttchrome.App.prototype.onMouse_click = function (cX, cY) {
  if (this.cancelDownloadAndPaste())
    return;
  switch (this.buf.mouseCursor) {
    case 1:
      this.telnetCore.send('\x1b[D');  //Arrow Left
      break;
    case 2:
      this.telnetCore.send('\x1b[5~'); //Page Up
      break;
    case 3:
      this.telnetCore.send('\x1b[6~'); //Page Down
      break;
    case 4:
      this.telnetCore.send('\x1b[1~'); //Home
      break;
    case 5:
      this.telnetCore.send('\x1b[4~'); //End
      break;
    case 6:
      if (this.buf.nowHighlight != -1) {
        var sendstr = '';
        if (this.buf.cur_y > this.buf.nowHighlight) {
          var count = this.buf.cur_y - this.buf.nowHighlight;
          for (var i = 0; i < count; ++i)
            sendstr += '\x1b[A'; //Arrow Up
        } else if (this.buf.cur_y < this.buf.nowHighlight) {
          var count = this.buf.nowHighlight - this.buf.cur_y;
          for (var i = 0; i < count; ++i)
            sendstr += '\x1b[B'; //Arrow Down
        }
        sendstr += '\r';
        this.telnetCore.send(sendstr);
      }
      break;
    case 7:
      var pos = this.clientToPos(cX, cY);
      var sendstr = '';
      if (this.buf.cur_y > pos.row) {
        var count = this.buf.cur_y - pos.row;
        for (var i = 0; i < count; ++i)
          sendstr += '\x1b[A'; //Arrow Up
      } else if (this.buf.cur_y < pos.row) {
        var count = pos.row - this.buf.cur_y;
        for (var i = 0; i < count; ++i)
          sendstr += '\x1b[B'; //Arrow Down
      }
      sendstr += '\r';
      this.telnetCore.send(sendstr);
      break;
    case 0:
      this.telnetCore.send('\x1b[D'); //Arrow Left
      break;
    case 8:
      this.telnetCore.send('['); //Previous post with the same title
      break;
    case 9:
      this.telnetCore.send(']'); //Next post with the same title
      break;
    case 10:
      this.telnetCore.send('='); //First post with the same title
      break;
    case 12:
      this.telnetCore.send('\x1b[D\r\x1b[4~'); //Refresh post / pushed texts
      break;
    case 13:
      this.telnetCore.send('\x1b[D\r\x1b[4~[]'); //Last post with the same title (LIST)
      break;
    case 14:
      this.telnetCore.send('\x1b[D\x1b[4~[]\r'); //Last post with the same title (READING)
      break;
    default:
      //do nothing
      break;
  }
};

pttchrome.App.prototype.overlayCommandListener = function (e) {
  var elm = e.target;
  var cmd = elm.getAttribute("bbsfoxCommand");
  dumpLog(DUMP_TYPE_LOG, cmd);
  if (elm) {
    if (elm.id == 'cmdHandler') {
      switch (cmd) {
        case "doArrowUp":
          if (this.cancelDownloadAndPaste())
            return;
          this.telnetCore.send('\x1b[A');
          break;
        case "doArrowDown":
          if (this.cancelDownloadAndPaste())
            return;
          this.telnetCore.send('\x1b[B');
          break;
        case "doPageUp":
          if (this.cancelDownloadAndPaste())
            return;
          this.telnetCore.send('\x1b[5~');
          break;
        case "doPageDown":
          if (this.cancelDownloadAndPaste())
            return;
          this.telnetCore.send('\x1b[6~');
          break;
        case "cancelHoldMouse":
          this.cancelMouseDownTimer();
          break;
        case "prevousThread":
          if (this.cancelDownloadAndPaste())
            return;
          this.buf.SetPageState();
          if (this.buf.PageState==2 || this.buf.PageState==3 || this.buf.PageState==4) {
            this.cancelMouseDownTimer();
            this.telnetCore.send('[');
          }
          break;
        case "nextThread":
          if (this.cancelDownloadAndPaste())
            return;
          this.buf.SetPageState();
          if (this.buf.PageState==2 || this.buf.PageState==3 || this.buf.PageState==4) {
            this.cancelMouseDownTimer();
            this.telnetCore.send(']');
          }
          break;
        case "reloadTabIconDelay":
          this.doReloadTabIcon(100);
          break;
        case "reloadTabIcon":
          //alert('reloadTabIcon');
          this.reloadTabIcon();
          break;
        case "doAddTrack":
          this.doAddTrack();
          break;
        case "doDelTrack":
          this.doDelTrack();
          break;
        case "doClearTrack":
          this.doClearTrack();
          break;
        case "openSymbolInput":
          if (this.symbolinput) {
            this.symbolinput.setCore(this);
            this.symbolinput.displayWindow();
          }
          break;
        case "doSavePage":
          this.doSavePage();
          break;
        case "doCopyHtml":
          this.doCopyHtml();
          break;
        case "doSelectAll":
          this.doSelectAll();
          break;
        case "doCopy":
          this.doCopySelect();
          break;
        case "doPaste":
          this.doPaste();
          break;
        case "doDelayPasteText":
          this.doDelayPasteText();
          break;
        case "doOpenAllLink":
          this.doOpenAllLink();
          break;
        //case "doLoadUserSetting":
        //  this.doLoadUserSetting();
        //  break;
        case "switchMouseBrowsing":
          this.switchMouseBrowsing();
          break;
        case "switchBgDisplay":
          this.switchBgDisplay();
          break;
        case "checkFireGestureKey":
          if (this.cancelDownloadAndPaste())
            return;
          this.checkFireGestureKey();
          break;
        case "openYoutubeWindow":
          var param = elm.getAttribute("YoutubeURL");
          elm.removeAttribute("YoutubeURL");
          if (this.playerMgr)
            this.playerMgr.openYoutubeWindow(param);
          break;
        case "openUstreamWindow":
          var param = elm.getAttribute("UstreamURL");
          elm.removeAttribute("UstreamURL");
          if (this.playerMgr)
            this.playerMgr.openUstreamWindow(param);
          break;
        case "openUrecordWindow":
          var param = elm.getAttribute("UrecordURL");
          elm.removeAttribute("UrecordURL");
          if (this.playerMgr)
            this.playerMgr.openUrecordWindow(param);
          break;
        case "previewPicture":
          var param = elm.getAttribute("PictureURL");
          elm.removeAttribute("PictureURL");
          if (this.picViewerMgr)
            this.picViewerMgr.openPicture(param);
          break;
        case "doLoadFile":
          this.buf.loadFile();
          break;
        case "doSaveFile":
          this.buf.saveFile();
          break;
        case "checkPrefExist":
          this.doSiteSettingCheck(250);
          break;
        case "pushThread":
          this.doPushThread();
          break;
        case "setAlert":
          var param = elm.getAttribute("AlertMessage");
          elm.removeAttribute("AlertMessage");
          //this.view.showAlertMessage(document.title, param);
          //alert(param);
          break;
        default:
          //e v a l("bbsfox."+cmd+"();"); //unsafe javascript? how to fix it?
          break;
      }
    }
    elm.removeAttribute("bbsfoxCommand");
  }
};

pttchrome.App.prototype.onMouse_move = function(cX, cY) {
  var pos = this.clientToPos(cX, cY);
  this.buf.onMouse_move(pos.col, pos.row, false);
};

pttchrome.App.prototype.resetMouseCursor = function(cX, cY) {
  this.buf.BBSWin.style.cursor = 'auto';
  this.buf.mouseCursor = 11;
};

pttchrome.App.prototype.clearHighlight = function() {
  this.buf.clearHighlight();
};

pttchrome.App.prototype.onPrefChange = function(pref, name) {
  try {
    //var CiStr = Components.interfaces.nsISupportsString;
    //dumpLog(DUMP_TYPE_LOG, "onPrefChange " + name + ":" + pref.getPrefValue(name));
    switch (name) {
    case MOUSE_WHEEL_FUNC1:
      this.CmdHandler.setAttribute(MOUSE_WHEEL_FUNC1, pref.getPrefValue(name));
      break;
    case MOUSE_WHEEL_FUNC2:
      this.CmdHandler.setAttribute(MOUSE_WHEEL_FUNC2, pref.getPrefValue(name));
      break;
    case MOUSE_WHEEL_FUNC3:
      this.CmdHandler.setAttribute(MOUSE_WHEEL_FUNC3, pref.getPrefValue(name));
      break;
    case USE_MOUSE_BROWSING:
      if (pref.getPrefValue(name)) {
        this.CmdHandler.setAttribute(USE_MOUSE_BROWSING, '1');
        this.buf.useMouseBrowsing = true;
      } else {
        this.CmdHandler.setAttribute(USE_MOUSE_BROWSING, '0');
        this.buf.useMouseBrowsing = false;
      }
      if (!this.buf.useMouseBrowsing) {
        this.buf.BBSWin.style.cursor = 'auto';
        this.buf.clearHighlight();
        this.buf.mouseCursor = 0;
        this.buf.nowHighlight = -1;
        this.buf.tempMouseCol = 0;
        this.buf.tempMouseRow = 0;
      }
      this.buf.SetPageState();
      this.buf.resetMousePos();
      this.view.redraw(true);
      this.view.updateCursorPos();
      break;
    case MOUSE_BROWSING_HIGH_LIGHT:
      this.buf.highlightCursor = pref.getPrefValue(name);
      this.view.redraw(true);
      this.view.updateCursorPos();
      break;
    case HIGHLIGHT_BG:
      this.view.highlightBG = pref.getPrefValue(name);
      if (this.view.highlightBG > 15 || this.view.highlightBG < 0)
        this.view.highlightBG = 2;
      //this.buf.highlightCursor=branch.getBoolPref(name);
      //this.view.redraw(true);
      //this.view.updateCursorPos();
      break;
    case MOUSE_BROWSING_HAND_POINTER:
      this.buf.handPointerCursor = pref.getPrefValue(name);
      break;
    case USE_MOUSE_BROWSING_EX:
      this.buf.useMouseBrowsingEx = pref.getPrefValue(name);
      //this.view.redraw(true);
      //this.view.updateCursorPos();
      break;
    case MOUSE_BROWSING_SEND_ENTER:
      this.view.useMouseBrowseSendEnter = pref.getPrefValue(name);
      break;
    case MIDDLE_BTN_FUNCTION:
      this.view.middleButtonFunction = pref.getPrefValue(name);
      break;
    case "DropToPaste":
      this.view.dropToPaste = branch.getBoolPref(name);
      break;
    case TERM_TYPE:
      this.telnetCore.termType = pref.getPrefValue(name);
      break;
    case BBS_SIZE:
    case FONT_FIT_WINDOW_WIDTH:
      this.view.screenType = pref.getPrefValue(name);
      if (this.view.screenType == 0) {
        this.view.bbsWidth = 0;
        this.view.bbsHeight = 0;
        this.view.fontFitWindowWidth = pref.getPrefValue(FONT_FIT_WINDOW_WIDTH);
      } else if (this.view.screenType == 1) {
        this.view.bbsWidth = pref.getPrefValue(VIEW_WIDTH);
        this.view.bbsHeight = pref.getPrefValue(VIEW_HEIGHT);
        this.view.fontFitWindowWidth = false;
      } else {
        this.view.bbsWidth = 0;
        this.view.bbsHeight = 0;
        this.view.bbsFontSize = pref.getPrefValue(VIEW_FONT_SIZE);
        this.view.fontFitWindowWidth = false;
      }
      this.view.fontResize();
      this.view.updateCursorPos();
      break;
    case "FontSize":
      if (this.view.screenType == 0) {
        this.view.bbsWidth = 0;
        this.view.bbsHeight = 0;
      } else if (this.view.screenType == 1) {
        this.view.bbsWidth = branch.getIntPref('bbsbox.width');
        this.view.bbsHeight = branch.getIntPref('bbsbox.height');
      } else {
        this.view.bbsWidth = 0;
        this.view.bbsHeight = 0;
        this.view.bbsFontSize = branch.getIntPref('FontSize');
        this.view.fontResize();
        this.view.updateCursorPos();
      }
      break;
    case "bbsbox.width":
    case "bbsbox.height":
      if (this.view.screenType == 0) {
        this.view.bbsWidth = 0;
        this.view.bbsHeight = 0;
      } else if (this.view.screenType == 1) {
        this.view.bbsWidth = branch.getIntPref('bbsbox.width');
        this.view.bbsHeight = branch.getIntPref('bbsbox.height');
        this.view.fontResize();
        this.view.updateCursorPos();
      } else {
        this.view.bbsWidth = 0;
        this.view.bbsHeight = 0;
        this.view.bbsFontSize = branch.getIntPref('FontSize');
      }
      break;
    case "LoadUrlInBG":
      this.loadURLInBG = branch.getBoolPref(name);
      var allLinks = document.getElementsByTagName('a');
      for (var i = 0; i < allLinks.length; i++) {
        if (this.loadURLInBG) //this is only for developer testing
          allLinks[i].setAttribute('onclick', "bbsfox.bgtab(event, this);" );
        else
          allLinks[i].removeAttribute('onclick');
      }
      break;
    case "LineWrap":
      this.telnetCore.lineWrap = branch.getIntPref(name);
      break;
    case "LineFeed":
      this.buf.disableLinefeed = !branch.getBoolPref(name);
      break;
    case H_ALIGN_CENTER:
      this.view.horizontalAlignCenter = pref.getPrefValue(name);
      if (this.view.horizontalAlignCenter) {
        this.view.BBSWin.setAttribute("align", "center");
        this.view.mainDisplay.style.transformOrigin = 'center';
      } else {
        this.view.BBSWin.setAttribute("align", "left");
        this.view.mainDisplay.style.transformOrigin = 'left';
      }
      break;
    case V_ALIGN_CENTER:
      this.view.verticalAlignCenter = pref.getPrefValue(name);
      this.view.fontResize();
      break;
    case FONT_FACE:
      this.view.fontFace = pref.getPrefValue(name);
      if (!this.view.fontFace) 
        this.view.fontFace='monospace';
      this.view.mainDisplay.style.fontFamily = this.view.fontFace;
      document.getElementById('cursor').style.fontFamily = this.view.fontFace;
      break;
    case ESCAPE_STR:
      var str = pref.getPrefValue(name);
      this.telnetCore.EscChar = this.buf.parseText(str);
      break;
    case ENTER_TYPE:
      switch (pref.getPrefValue(name)) {
      case '1':
        this.view.EnterChar = '\r\n';
        break;
      case '0':
      default:
        this.view.EnterChar = '\r';
        break;
      }
      break;
    case "ClearCopiedSel":
      this.clearCopiedSel=branch.getBoolPref(name);
      break;
    case "Charset":
      //var charset=branch.getComplexValue(name, CiStr).data;
      if (charset == 'locale') {
        charset = 'big5';
      }
      if (charset=='UTF-8' && (this.isPTT(document.location.hostname))) {
        this.buf.forceFullWidth = true;
      } else {
        this.buf.forceFullWidth = false;
      }
      this.view.charset = charset;
      this.view.redraw(true);
      break;
    case DBCS_DETECT:
      this.view.dbcsDetect = pref.getPrefValue(name);
      break;
    case CLOSE_QUERY:
      if (pref.getPrefValue(name))
        this.regExitAlert();
      else
        this.unregExitAlert();
      break;
    case DETECT_LINK:
      this.view.useHyperLink = pref.getPrefValue(name);
      if (this.view.useHyperLink) {
        //this.previewLink = prefs.getBoolPref('HyperLink.PreviewLink');
        //this.previewWithCtrl = prefs.getBoolPref('HyperLink.PreviewWithCtrl');
        //this.previerWindowHeight = prefs.getIntPref('HyperLink.PrevierWindowHeight');
      } else {
        //this.previewLink = false;
        //this.previewWithCtrl = false;
        //this.previerWindowHeight = 150;
      }
      this.view.redraw(true);
      break;
    case IDLE_STR:
      this.antiIdleStr = pref.getPrefValue(name);
      break;
    case IDLE_TIME:
      this.antiIdleTime = pref.getPrefValue(name) * 1000;
      //this.telnetCore.send();
      break;
    case HOTKEY_CTRL_W:
      this.view.hotkeyCtrlW = pref.getPrefValue(name);
      break;
    case "HotkeyCtrlB":
      this.view.hotkeyCtrlB = branch.getIntPref(name);
      break;
    case HOTKEY_CTRL_L:
      this.view.hotkeyCtrlL = pref.getPrefValue(name);
      break;
    case "HokeyForCopy":
      this.view.hokeyForCopy = branch.getBoolPref(name);
      break;
    case "HokeyForPaste":
      this.view.hokeyForPaste = branch.getBoolPref(name);
      break;
    case "Hokey2ForPaste":
      this.view.hokey2ForPaste = branch.getBoolPref(name);
      break;
    case HOKEY_FOR_SELECT_ALL:
      this.view.hokeyForSelectAll = pref.getPrefValue(name);
      break;
    case HOKEY_FR_MOUSE_BROWSING:
      if (pref.getPrefValue(name))
        this.CmdHandler.setAttribute("HokeyForMouseBrowsing", '1');
      else
        this.CmdHandler.setAttribute("HokeyForMouseBrowsing", '0');
      break;
    case HOKEY_FOR_EASY_READING:
      this.view.hokeyForEasyReading = pref.getPrefValue(name);
      break;
    case HOKEY_FOR_DOWNLOAD_POST:
      this.view.hokeyForDownloadPost = pref.getPrefValue(name);
      break;
    case HOTKEY_DOWNLOAD_TYPE:
      this.view.hotkeyDownloadType = pref.getPrefValue(name);
      break;
    case "SavePageMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("SavePageMenu", '1');
      else
        this.CmdHandler.setAttribute("SavePageMenu", '0');
      break;
    case "EmbeddedPlayerMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("EmbeddedPlayerMenu", '1');
      else
        this.CmdHandler.setAttribute("EmbeddedPlayerMenu", '0');
      break;
    case "PreviewPictureMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("PreviewPictureMenu", '1');
      else
        this.CmdHandler.setAttribute("PreviewPictureMenu", '0');
      break;
    case "ScreenKeyboardMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("ScreenKeyboardMenu", '1');
      else
        this.CmdHandler.setAttribute("ScreenKeyboardMenu", '0');
      break;
    case "OpenAllLinkMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("OpenAllLinkMenu", '1');
      else
        this.CmdHandler.setAttribute("OpenAllLinkMenu", '0');
      break;
    case "MouseBrowseMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("MouseBrowseMenu", '1');
      else
        this.CmdHandler.setAttribute("MouseBrowseMenu", '0');
      break;
    case "CopyHtmlMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("CopyHtmlMenu", '1');
      else
        this.CmdHandler.setAttribute("CopyHtmlMenu", '0');
      break;
    case "KeyWordTrackMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("KeyWordTrackMenu", '1');
      else
        this.CmdHandler.setAttribute("KeyWordTrackMenu", '0');
      break;
    case "DelayPasteMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("DelayPasteMenu", '1');
      else
        this.CmdHandler.setAttribute("DelayPasteMenu", '0');
      break;
    case "DownloadPostMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("DownloadPostMenu", '1');
      else
        this.CmdHandler.setAttribute("DownloadPostMenu", '0');
      break;
    case "EasyReadingMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("EasyReadingMenu", '1');
      else
        this.CmdHandler.setAttribute("EasyReadingMenu", '0');
      break;
    case "PushThreadMenu":
      if (branch.getBoolPref(name) && (this.isPTT(document.location.hostname)) )
        this.CmdHandler.setAttribute("PushThreadMenu", '1');
      else
        this.CmdHandler.setAttribute("PushThreadMenu", '0');
      break;
    case "FileIoMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("FileIoMenu", '1');
      else
        this.CmdHandler.setAttribute("FileIoMenu", '0');
      break;
    case "DownloadLineDelay":
      this.buf.downloadLineDelay = branch.getIntPref(name);
      break;
    case "SaveAfterDownload":
      this.buf.saveAfterDownload = branch.getBoolPref(name);
      break;
    case "EasyReadingWithImg":
      this.view.easyReadingWithImg = branch.getBoolPref(name);
      break;
    case "ScreenKeyboardAlpha":
      if (this.symbolinput)
        this.symbolinput.setWindowAlpha(branch.getIntPref(name));
      break;
    case "EmbeddedPlayerSize":
      if (this.playerMgr)
        this.playerMgr.setDefaultWindowSize(branch.getIntPref(name));
      break;
    case "EPAutoPlay":
      if (this.playerMgr)
        this.playerMgr.epAutoPlay = branch.getBoolPref(name);
      break;
    case "EPLoop":
      if (this.playerMgr)
        this.playerMgr.epLoop = branch.getBoolPref(name);
      break;
    case "EPAutoUseHQ":
      if (this.playerMgr)
        this.playerMgr.epAutoUseHQ = branch.getBoolPref(name);
      break;
    case "EPCopyUrlButton":
      if (this.playerMgr) {
        this.playerMgr.epCopyUrlButton = branch.getBoolPref(name);
        this.playerMgr.setAllEmbededPlayerUrlBtn(this.playerMgr.epCopyUrlButton);
      }
      break;
    case "EPWhenDropLink":
      if (this.playerMgr)
        this.playerMgr.epWhenDropLink = branch.getBoolPref(name);
      break;
    case "UseHttpContextMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("webContextMenu", '1');
      else
        this.CmdHandler.setAttribute("webContextMenu", '0');
      break;
    case "NotifyWhenBackbround":
      this.buf.notifyWhenBackbround = branch.getBoolPref(name);
      break;
    case "NotifyBySound":
      this.buf.notifyBySound = branch.getBoolPref(name);
      break;
    case "NotifyByMessage":
      this.buf.notifyByMessage = branch.getBoolPref(name);
      break;
    case "HideBookMarkLinkMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("hideBookMarkLink", '1');
      else
        this.CmdHandler.setAttribute("hideBookMarkLink", '0');
      break;
    case "HideSendLinkMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("hideSendLink", '1');
      else
        this.CmdHandler.setAttribute("hideSendLink", '0');
      break;
    case "HideBookMarkPageMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("hideBookMarkPage", '1');
      else
        this.CmdHandler.setAttribute("hideBookMarkPage", '0');
      break;
    case "HideSendPageMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("hideSendPage", '1');
      else
        this.CmdHandler.setAttribute("hideSendPage", '0');
      break;
    case "HideViewInfoMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("hideViewInfo", '1');
      else
        this.CmdHandler.setAttribute("hideViewInfo", '0');
      break;
    case "HideInputBuffer":
      this.view.hideInputBuffer = branch.getBoolPref(name);
      if (!this.view.hideInputBuffer) {
        this.DocInputArea.style.border = 'none';
        this.DocInputArea.style.width =  '200px';
        this.DocInputArea.style.height = '24px';
        this.DocInputArea.style.top =    '0px';
        this.DocInputArea.style.left =   '-10000px';
      }
      break;
    case "InputBufferSizeType":
      this.view.inputBufferSizeType = branch.getIntPref(name);
      break;
    case "DefineInputBufferSize":
      this.view.defineInputBufferSize = branch.getIntPref(name);
      break;
    case "UseKeyWordTrack":
      if (branch.getBoolPref(name)) {
        this.CmdHandler.setAttribute("useKeyWordTrack", '1');
        this.view.useKeyWordTrack = true;
      } else {
        this.CmdHandler.setAttribute("useKeyWordTrack", '0');
        this.view.useKeyWordTrack = false;
      }
      this.view.redraw(true);
      this.view.updateCursorPos();
      break;
    case "DeleteSpaceWhenCopy":
      this.deleteSpaceWhenCopy = branch.getBoolPref(name);
      break;
    case "PushThreadLineLength":
      this.pushThreadLineLength = branch.getIntPref(name);
      break;
    case "EnablePicturePreview":
      this.view.enablePicturePreview = branch.getBoolPref(name);
      break;
    case "CtrlPicturePreview":
      this.view.ctrlPicturePreview = branch.getBoolPref(name);
      break;
    case "PicturePreviewInfo":
      this.view.picturePreviewInfo = branch.getBoolPref(name);
      break;
    case "PicturePreviewHeight":
      this.view.picturePreviewHeight = branch.getIntPref(name);
      this.CmdHandler.setAttribute('LastPicAddr', '0');
      break;
    case "preloginprompt":
      var str = pref.getPrefValue(name);
      this.telnetCore.loginPrompt[0] = this.buf.parseText(str);
      break;
    case "loginprompt":
      var str = pref.getPrefValue(name);
      this.telnetCore.loginPrompt[1] = this.buf.parseText(str);
      break;
    case "passwordprompt":
      var str = pref.getPrefValue(name);
      this.telnetCore.loginPrompt[2] = this.buf.parseText(str);
      break;
    case "prelogin":
      var str = pref.getPrefValue(name);
      this.telnetCore.loginStr[0] = this.buf.parseText(str);
      break;
    case "postlogin":
      var str = pref.getPrefValue(name);
      this.telnetCore.loginStr[3] = this.buf.parseText(str);
      break;
    case "login":
      var str = pref.getPrefValue(name);
      this.telnetCore.loginStr[1] = this.buf.parseText(str);
      break;
    case "passwd":
      var str = pref.getPrefValue(name);
      this.telnetCore.loginStr[2] = this.buf.parseText(str);
      break;
//
    case DISPLAY_BORDER:
    case BORDER_COLOR:
      var borderColor = pref.getPrefValue(BORDER_COLOR);
      if (pref.getPrefValue(DISPLAY_BORDER))
        this.view.mainDisplay.style.border = '1px solid ' + termColors[borderColor];
      else
        this.view.mainDisplay.style.border = '0px';
      break;
    case "backgroundbrightness":
      var brightness = pref.getPrefValue(name);
      if (brightness == 100)// no alpha
        this.BBSBg.style.opacity = '1';
      else
        this.BBSBg.style.opacity = '0.' + (brightness);
      break;
    case "backgroundtype":
    case "backgrounddata":
      var bt = pref.getPrefValue("backgroundtype");
      var str = pref.getPrefValue("backgrounddata");//branch.getComplexValue('BackgroundImageMD5', CiStr).data;
      if (bt != 0 && str != '') {
        try {
          this.BBSBg.style.backgroundImage = 'url('+str+')';

          if (bt == 4) {
            if(this.FXVersion >= 4.0) //for firefox 4
              this.BBSBg.style.backgroundSize = '100% 100%';
            else
              this.BBSBg.style.MozBackgroundSize = '100% 100%';
            this.BBSBg.style.backgroundPosition = 'left top';
            this.BBSBg.style.backgroundRepeat = 'no-repeat';
          } else if (bt == 3) {
            if (this.FXVersion >= 4.0) //for firefox 4
              this.BBSBg.style.backgroundSize = 'cover';
            else
              this.BBSBg.style.MozBackgroundSize = 'cover';
            this.BBSBg.style.backgroundPosition = 'left top';
            this.BBSBg.style.backgroundRepeat = 'no-repeat';
          } else if (bt == 2) {
            if (this.FXVersion >= 4.0) //for firefox 4
              this.BBSBg.style.backgroundSize = 'auto auto';
            else
              this.BBSBg.style.MozBackgroundSize = 'auto auto';
            this.BBSBg.style.backgroundPosition = 'center center';
            this.BBSBg.style.backgroundRepeat = 'no-repeat';
          } else if (bt == 1) {
            if (this.FXVersion >= 4.0) //for firefox 4
              this.BBSBg.style.backgroundSize = 'auto auto';
            else
              this.BBSBg.style.MozBackgroundSize = 'auto auto';
            this.BBSBg.style.backgroundPosition = 'center center';
            this.BBSBg.style.backgroundRepeat = 'repeat';
          }
        } catch(ex) {
          bt = 0;
        }
        //try to load picture, if load fail, set bt = 0;
      }
      if (bt == 0) {
        this.BBSBg.style.display = 'none';
        this.CmdHandler.setAttribute("EnableBackground", '0');
        this.view.DisplayBackground = true;
        this.view.BackgroundMD5 = '';
      } else {
        this.BBSBg.style.display = 'block';
        this.CmdHandler.setAttribute("EnableBackground", '1');
        this.view.DisplayBackground = true;
      }
      break;
//
    case HOKEY_FOR_BG_DISPLAY:
      this.view.hokeyForBgDisplay = pref.getPrefValue(name);
      break;
    case "SwitchBgDisplayMenu":
      if (branch.getBoolPref(name))
        this.CmdHandler.setAttribute("SwitchBgDisplayMenu", '1');
      else
        this.CmdHandler.setAttribute("SwitchBgDisplayMenu", '0');
      break;
    }
  } catch(e) {
    // eats all errors
    return;
  }
};

pttchrome.App.prototype.checkClass = function(cn) {
  return (  cn.indexOf("closeSI") >=0  || cn.indexOf("EPbtn") >= 0
          || cn.indexOf("closePP") >= 0 || cn.indexOf("picturePreview") >= 0
          || cn.indexOf("drag") >= 0    || cn.indexOf("floatWindowClientArea") >= 0
          || cn.indexOf("WinBtn") >= 0  || cn.indexOf("sBtn") >= 0
          || cn.indexOf("nonspan") >= 0 );
};

pttchrome.App.prototype.cancelDownloadAndPaste = function() {
  var rtn = false;
  if (this.DelayPasteBuffer != '' || this.DelayPasteIndex != -1)
  {
    this.DelayPasteBuffer = '';
    this.DelayPasteIndex = -1;
    //this.view.showAlertMessage(document.title, this.getLM('delayPasteStop'));
    rtn = true;
  }
  if (this.downpostcounter) {
    //this.downpostcounter.cancel();
    this.downpostcounter = null;
    this.post_text = new Array();
    this.post_html = new Array();
    this.view.doBlink = true;
    //this.view.showAlertMessage(document.title, this.getLM('alert_down_terminate'));
    rtn = true;
  }
  return rtn;
};

pttchrome.App.prototype.mouse_click = function(e) {
  var skipMouseClick = (this.CmdHandler.getAttribute('SkipMouseClick') == '1');
  this.CmdHandler.setAttribute('SkipMouseClick','0');
  if (this.cancelDownloadAndPaste())
    return;

  if (e.button == 2) { //right button
  } else if (e.button == 0) { //left button
    if (e.target && e.target.getAttribute("link") == 'true') {
      return;
    }
    if (window.getSelection().isCollapsed) { //no anything be select
      if (this.buf.useMouseBrowsing) {
        var doMouseCommand = true;
        if (e.target.className)
          if (this.checkClass(e.target.className))
            doMouseCommand = false;
        if (e.target.tagName)
          if(e.target.tagName.indexOf("menuitem") >= 0 )
            doMouseCommand = false;
        if (skipMouseClick) {
          doMouseCommand = false;
          var pos = this.clientToPos(e.clientX, e.clientY);
          this.buf.onMouse_move(pos.col, pos.row, true);
        }
        if (doMouseCommand) {
          this.onMouse_click(e.clientX, e.clientY);
          this.setDblclickTimer();
          e.preventDefault();
          this.setInputAreaFocus();
        }
      }
    }
  } else if (e.button == 1) { //middle button
    if (e.target && e.target.parentNode) {
      if (e.target.getAttribute("link") == 'true')
        return;
    }
    if (this.view.middleButtonFunction == 1)
      this.telnetCore.send('\r');
    else if (this.view.middleButtonFunction == 2) {
      this.buf.SetPageState();
      if (this.buf.PageState == 2 || this.buf.PageState == 3 || this.buf.PageState == 4)
        this.telnetCore.send('\x1b[D');
    }
  } else {
  }
};

pttchrome.App.prototype.mouse_down_init = function(e) {
  this.CmdHandler.setAttribute('mouseOnPicWindow', '0');
};

pttchrome.App.prototype.mouse_down = function(e) {
  //0=left button, 1=middle button, 2=right button
  if (e.button == 0) {
    if (this.buf.useMouseBrowsing) {
      if (this.dblclickTimer) { //skip
        e.preventDefault();
        e.stopPropagation();
        e.cancelBubble = true;
      }
      this.setDblclickTimer();
    }
    this.mouseLeftButtonDown = true;
    //this.setInputAreaFocus();
    if (!(window.getSelection().isCollapsed))
      this.CmdHandler.setAttribute('SkipMouseClick','1');

    var onbbsarea = true;
    if (e.target.className)
      if (this.checkClass(e.target.className))
        onbbsarea = false;
    if (e.target.tagName)
      if (e.target.tagName.indexOf("menuitem") >= 0 )
        onbbsarea = false;
    // Press left key for 1 sec
    this.cancelMouseDownTimer();
    //this.mouseDownTimeout = false;
    if (window.getSelection().isCollapsed && this.buf.useMouseBrowsing 
        && this.view.useMouseBrowseSendEnter && onbbsarea) {

      var _this = this;
      this.mouseDownTimer = setTimer(false, function() {
        clearTimeout(_this.mouseDownTimer);
        if (_this.mouseLeftButtonDown && window.getSelection().isCollapsed)
          _this.telnetCore.send(_this.view.EnterChar);
        _this.mouseDownTimer = null;
        _this.CmdHandler.setAttribute('SkipMouseClick','1');
      }, 1000);
    }
  } else if(e.button == 2) {
    this.mouseRightButtonDown = true;
    //create context menu
    this.resetMenuItems();
  }
};

pttchrome.App.prototype.mouse_up = function(e) {
  //0=left button, 1=middle button, 2=right button
  if (e.button == 0) {
    this.cancelMouseDownTimer();
    this.setMbTimer();
    //this.CmdHandler.setAttribute('MouseLeftButtonDown', '0');
    this.mouseLeftButtonDown = false;
  } else if (e.button == 2) {
    this.mouseRightButtonDown = false;
    //this.CmdHandler.setAttribute('MouseRightButtonDown', '0');
  }

  if (e.button == 0 || e.button == 2) { //left or right button
    if (window.getSelection().isCollapsed) { //no anything be select
      if (this.buf.useMouseBrowsing)
        this.onMouse_move(e.clientX, e.clientY);

      this.setInputAreaFocus();
      if (e.button == 0) {
        var preventDefault = true;
        if (e.target.className)
          if (this.checkClass(e.target.className))
            preventDefault = false;
        if (e.target.tagName)
          if (e.target.tagName.indexOf("menuitem") >= 0 )
            preventDefault = false;
        if (preventDefault)
          e.preventDefault();
      }
    } else { //something has be select
      //document.getElementById('t').disabled="disabled"; //prevent input area get focus, if it get focus, select area will disappear
      //pttchrome.app.clearHighlight(); don't do this
      //document.getElementById('t').focus(); // if re-set focuse to input area, select area will disappear
    }
  } else {
    this.setInputAreaFocus();
    e.preventDefault();
  }
  var _this = this;
  this.focusTimer = setTimer(false, function() {
    clearTimeout(_this.focusTimer);
    _this.focusTimer = null;
    if (window.getSelection().isCollapsed)
      _this.setInputAreaFocus();
  }, 10);
  //if (e.button == 2)
  //  this.checkFireGestureKey();
};

pttchrome.App.prototype.mouse_move = function(e) {
  this.view.tempPicX = e.clientX;
  this.view.tempPicY = e.clientY;
  //if we draging window, pass all detect.
  if (this.playerMgr && this.playerMgr.dragingWindow) {
    var dW = this.playerMgr.dragingWindow;
    if (this.CmdHandler.getAttribute("DragingWindow") == '1') {
      dW.playerDiv.style.left = dW.tempCurX + (e.pageX - dW.offX) + 'px';
      dW.playerDiv.style.top = dW.tempCurY + (e.pageY - dW.offY) + 'px';
      e.preventDefault();
      return;
    } else if (this.CmdHandler.getAttribute("DragingWindow") == '2') {
      dW.playerDiv2.style.left = dW.tempCurX + (e.pageX - dW.offX) + 'px';
      dW.playerDiv2.style.top = dW.tempCurY + (e.pageY - dW.offY) + 'px';
      e.preventDefault();
      return;
    }
  } else if (this.picViewerMgr && this.picViewerMgr.dragingWindow) {
    var dW = this.picViewerMgr.dragingWindow;
    dW.viewerDiv.style.left = dW.tempCurX + (e.pageX - dW.offX) + 'px';
    dW.viewerDiv.style.top = dW.tempCurY + (e.pageY - dW.offY) + 'px';
    e.preventDefault();
    return;
  } else if (this.symbolinput && this.symbolinput.dragingWindow) {
    var dW = this.symbolinput.dragingWindow;
    if (this.CmdHandler.getAttribute("DragingWindow") == '3') {
      dW.mainDiv.style.left = dW.tempCurX + (e.pageX - dW.offX) + 'px';
      dW.mainDiv.style.top = dW.tempCurY + (e.pageY - dW.offY) + 'px';
      e.preventDefault();
      return;
    }
  }
  //
  if (e.target.className) {
    if(e.target.className.indexOf("q") >= 0) {
      if (this.view.enablePicturePreview 
          && (this.view.ctrlPicturePreview==false || (this.view.ctrlPicturePreview && e.ctrlKey) ) ) {
        //if (e.target.rel.toLowerCase() == "p")
        var url = null;// = e.target.parentNode.getAttribute("href");
        var hrel = null;// = e.target.parentNode.getAttribute("rel");
        var node = e.target;
        if (node.getAttribute("link") == 'true') {
          while (node.parentNode && !url) {
            node = node.parentNode;
            url = node.getAttribute("href");
            hrel = node.getAttribute("rel");
          }
        }
        if (hrel && hrel.toLowerCase() == 'p'
            && url.toLowerCase().indexOf("http://photo.xuite.net/") < 0
            && url.toLowerCase().indexOf("http://simplest-image-hosting.net/") < 0
            && url.toLowerCase().indexOf("http://screensnapr.com/") < 0) {

          this.setPicLocation(e.clientX, e.clientY);
          this.view.pictureWindow.style.display = "block";
          if (this.CmdHandler.getAttribute('LastPicAddr') == url) {
            //if(this.view.picturePreviewInfo)
            //  this.view.pictureInfoLabel.style.display='inline';
            //else
            //  this.view.pictureInfoLabel.style.display='none';
          } else {
            this.view.picturePreview.innerHTML = "";
            this.view.picturePreview.style.display = "none";
            this.view.pictureInfoLabel.style.display = "none";
            this.view.picLoadingImage.src="chrome://pttchrome/skin/state_icon/connecting.gif";
            this.view.picturePreviewLoading.style.display = "block";
            this.CmdHandler.setAttribute('LastPicAddr', url);
            var image = document.createElement('img');
            this.view.picturePreview.appendChild(image);
            image.onload = function(){
                pttchrome.app.prePicResize(this);
            };
            image.onerror = function(){
                pttchrome.app.picLoaderror(this);
            };
            image.setAttribute('src',url);
          }
        }
      }
    } else {// if(e.target.tagName.toLowerCase() == "img")
      //fix bug while no mouseout event to hide img
      //this.view.pictureWindow.style.display = "none";
    }
  }//end of if(e.target.className)

  if (this.buf.useMouseBrowsing) {
    if (window.getSelection().isCollapsed) {
      if(!this.mouseLeftButtonDown)
        this.onMouse_move(e.clientX, e.clientY);
    } else
      this.resetMouseCursor();
  }
};

pttchrome.App.prototype.mouse_over = function(e) {
  if(window.getSelection().isCollapsed && !this.mouseLeftButtonDown)
    this.setInputAreaFocus();
};

pttchrome.App.prototype.mouse_scroll = function(e) {
  var cmdhandler = this.CmdHandler;
  //if(!cmdhandler)
  //  return;

  var mouseWheelFunc1 = cmdhandler.getAttribute(MOUSE_WHEEL_FUNC1);//useMouseUpDown
  var mouseWheelFunc2 = cmdhandler.getAttribute(MOUSE_WHEEL_FUNC2);//useMouseSwitchPage
  var mouseWheelFunc3 = cmdhandler.getAttribute(MOUSE_WHEEL_FUNC3);//useMouseReadThread

  var useMouseWheelFunc1 = (mouseWheelFunc1 != '0');
  var useMouseWheelFunc2 = (mouseWheelFunc2 != '0');
  var useMouseWheelFunc3 = (mouseWheelFunc3 != '0');
  if (useMouseWheelFunc1 || useMouseWheelFunc2 || useMouseWheelFunc3) {
    //var curApp = this.view.cursorAppMode;
    if (e.wheelDelta > 0) {
      if(this.mouseRightButtonDown) {
        if(useMouseWheelFunc2) {
          if(mouseWheelFunc2 == '1')
            this.setBBSCmd('doArrowUp', cmdhandler);
          else if(mouseWheelFunc2 == '2')
            this.setBBSCmd('doPageUp', cmdhandler);
          else if(mouseWheelFunc2 == '3')
            this.setBBSCmd('prevousThread', cmdhandler);
          e.stopPropagation();
          e.preventDefault();
        }
      } else if (this.mouseLeftButtonDown) {
        if (useMouseWheelFunc3) {
          if (mouseWheelFunc3 == '1')
            this.setBBSCmd('doArrowUp', cmdhandler);
          else if (mouseWheelFunc3 == '2')
            this.setBBSCmd('doPageUp', cmdhandler);
          else if (mouseWheelFunc3 == '3')
            this.setBBSCmd('prevousThread', cmdhandler);
          this.setBBSCmd('cancelHoldMouse', cmdhandler);
          e.stopPropagation();
          e.preventDefault();
        }
      } else if (useMouseWheelFunc1) {
        if (mouseWheelFunc1 == '1')
          this.setBBSCmd('doArrowUp', cmdhandler);
        else if (mouseWheelFunc1 == '2')
          this.setBBSCmd('doPageUp', cmdhandler);
        else if (mouseWheelFunc1 == '3')
          this.setBBSCmd('prevousThread', cmdhandler);
        e.stopPropagation();
        e.preventDefault();
      }
    } else {
      if (this.mouseRightButtonDown) {
        if (useMouseWheelFunc2) {
          if (mouseWheelFunc2 == '1')
            this.setBBSCmd('doArrowDown', cmdhandler);
          else if (mouseWheelFunc2 == '2')
            this.setBBSCmd('doPageDown', cmdhandler);
          else if (mouseWheelFunc2 == '3')
            this.setBBSCmd('nextThread', cmdhandler);
          e.stopPropagation();
          e.preventDefault();
        }
      } else if (this.mouseLeftButtonDown) {
        if (useMouseWheelFunc3) {
          if (mouseWheelFunc3 == '1')
            this.setBBSCmd('doArrowDown', cmdhandler);
          else if (mouseWheelFunc3 == '2')
            this.setBBSCmd('doPageDown', cmdhandler);
          else if (mouseWheelFunc3 == '3')
            this.setBBSCmd('nextThread', cmdhandler);
          this.setBBSCmd('cancelHoldMouse', cmdhandler);
          e.stopPropagation();
          e.preventDefault();
        }
      } else if (useMouseWheelFunc1) {
        if (mouseWheelFunc1 == '1')
          this.setBBSCmd('doArrowDown', cmdhandler);
        else if (mouseWheelFunc1 == '2')
          this.setBBSCmd('doPageDown', cmdhandler);
        else if (mouseWheelFunc1 == '3')
          this.setBBSCmd('nextThread', cmdhandler);
        e.stopPropagation();
        e.preventDefault();
      }
    }
    if (this.mouseRightButtonDown && useMouseWheelFunc2) //prevent context menu popup
      cmdhandler.setAttribute('doDOMMouseScroll','1');
    if (this.mouseLeftButtonDown && useMouseWheelFunc3) {
      if (cmdhandler.getAttribute(USE_MOUSE_BROWSING) == '1') {
        cmdhandler.setAttribute('SkipMouseClick','1');
      }
    }
  }
};

pttchrome.App.prototype.context_menu = function(e) {
  var cmdhandler = this.CmdHandler;
  var mouseWheelFunc2 = (cmdhandler.getAttribute(MOUSE_WHEEL_FUNC2) != '0');
  if (mouseWheelFunc2) {
    var doDOMMouseScroll = (cmdhandler.getAttribute('doDOMMouseScroll') == '1');
    if (doDOMMouseScroll) {
      e.stopPropagation();
      e.preventDefault();
      cmdhandler.setAttribute('doDOMMouseScroll','0');
    } else {
    }
  } else {
  }
};

pttchrome.App.prototype.key_press = function(e) {
  if (this.cancelDownloadAndPaste()) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  if (e.charCode) {
    // Control characters
    if (e.ctrlKey && !e.altKey && !e.shiftKey 
        && (e.charCode == 99 || e.charCode == 67) 
        && !window.getSelection().isCollapsed
        && this.view.hokeyForCopy) { //^C , do copy
      //this.doCopySelect();
      e.preventDefault();
      e.stopPropagation();
      return;
    } else if (e.ctrlKey && !e.altKey && !e.shiftKey 
        && (e.charCode == 100 || e.charCode == 68) 
        && this.view.hokeyForDownloadPost) { //^D , do download post
      e.preventDefault();
      e.stopPropagation();
    } else if (e.ctrlKey && !e.altKey && !e.shiftKey 
        && (e.charCode == 101 || e.charCode == 69) 
        && this.view.hokeyForBgDisplay) { //^E , switch background display
      //this.switchBgDisplay();
      e.preventDefault();
      e.stopPropagation();
    } else if (e.ctrlKey && !e.altKey && !e.shiftKey 
        && (e.charCode == 103 || e.charCode == 71) 
        && this.view.hokeyForEasyReading) { //^G , easy reading mode
      e.preventDefault();
      e.stopPropagation();
    } else if (e.ctrlKey && !e.altKey && !e.shiftKey 
        && e.charCode == 46) { //Alt + ^+, do add Track word
      //this.doAddTrack();
      e.preventDefault();
      e.stopPropagation();
    } else if (e.ctrlKey && !e.altKey && !e.shiftKey 
        && e.charCode == 44) { //Alt + ^-, do del Track word
      //this.doDelTrack();
      e.preventDefault();
      e.stopPropagation();
    }
    if (window.getSelection().isCollapsed)
      this.setInputAreaFocus();
  } else {
    if (window.getSelection().isCollapsed)
      this.setInputAreaFocus();
  }
};

pttchrome.App.prototype.window_beforeunload = function(e) {
  //e.returnValue = confirm('Are you sure you want to leave '+document.title+'?');
  e.returnValue = true;
  return document.title;
};

pttchrome.App.prototype.regExitAlert = function() {
  this.unregExitAlert();
  this.alertBeforeUnload = true;
  window.addEventListener('beforeunload', this.window_beforeunload, false);
};

pttchrome.App.prototype.unregExitAlert = function() {
  // clear alert for closing tab
  if (this.alertBeforeUnload) {
    this.alertBeforeUnload = false;
    window.removeEventListener('beforeunload', this.window_beforeunload, false);
  }
};

pttchrome.App.prototype.setBBSCmd = function(cmd, cmdhandler) {
  //var doc = gBrowser.contentDocument;
  var doc = document;
  if (!cmdhandler)
    cmdhandler = this.getCmdHandler();

  if (cmdhandler && "createEvent" in doc) {
    cmdhandler.setAttribute('bbsfoxCommand', cmd);
    var evt = doc.createEvent("Events");
    evt.initEvent("OverlayCommand", false, false);
    cmdhandler.dispatchEvent(evt);
  }
};

pttchrome.App.prototype.createMenu = function(title, func, parentId, id) {
  var createProperties = { 
    "title": title, 
    "id": (id?id:title),
    "contexts": ["page", "selection"]
  };
  if (func)
    this.menuHandler[createProperties.id] = func;
  if (parentId)
    createProperties.parentId = parentId;

  return chrome.contextMenus.create(createProperties, function() {});
};

pttchrome.App.prototype.resetMenuItems = function() {
  chrome.contextMenus.removeAll();
  // create the contentMenu item
  var popup_paste = this.createMenu(msg("menu_paste"), function() {
      pttchrome.app.doPaste();
  }, null, 'paste');
  var popup_selectAll = this.createMenu(msg("menu_selAll"), function() {
      pttchrome.app.doSelectAll();
  }, null, 'selectall');
};
