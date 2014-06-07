// Main Program

var pttchrome = {};

pttchrome.App = function() {

  this.CmdHandler = document.getElementById('cmdHandler');
  this.CmdHandler.setAttribute('useMouseBrowsing', '1');
  //this.CmdHandler.setAttribute('useMouseUpDown', '0');
  //this.CmdHandler.setAttribute('useMouseSwitchPage', '0');
  //this.CmdHandler.setAttribute("useMouseReadThread", '0');
  this.CmdHandler.setAttribute('useTextDragAndDrop', '0');
  this.CmdHandler.setAttribute('webContextMenu', '1');
  this.CmdHandler.setAttribute('SavePageMenu', '1');
  this.CmdHandler.setAttribute('EmbeddedPlayerMenu', '1');
  this.CmdHandler.setAttribute('PreviewPictureMenu', '0');
  this.CmdHandler.setAttribute('PushThreadMenu', '0');
  this.CmdHandler.setAttribute('OpenAllLinkMenu', '0');
  this.CmdHandler.setAttribute("MouseBrowseMenu", '0');
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
  this.antiIdleStr = '^[[A^[[B';
  this.antiIdleTime = 0;
  this.deleteSpaceWhenCopy = true;
  this.loadURLInBG = false;
  this.clearCopiedSel = true;
  //new pref - end
  this.idleTime = 0;
  this.connectTime = 0;
  this.connectState = 0;

  this.DocInputArea = document.getElementById('t');
  this.BBSWin = document.getElementById('BBSWindow');

  // horizontally center bbs window
  this.BBSWin.setAttribute("align", "center");
  this.view.mainDisplay.style.transformOrigin = 'center';

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

  this.menuHandler = {};
  chrome.contextMenus.onClicked.addListener(function(onClickData, tab) {
    pttchrome.app.menuHandler[onClickData.menuItemId]();
  });

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
  addEventListener('keypress', keypress, true);
  addEventListener('keydown', keypress, true);

  this.view.fontResize();
  this.view.updateCursorPos();
  this.dblclickTimer=null;
  this.mouseDownTimer=null;
  this.mbTimer=null;

  /*
  window.controllers.insertControllerAt(0, this.documentControllers);            // to override default commands for window
  this.DocInputArea.controllers.insertControllerAt(0, this.documentControllers); // to override default commands for inputbox
  */
};

pttchrome.App.prototype.connect = function(url) {
  dumpLog(DUMP_TYPE_LOG, "connect to " + url);
  this.pref = new PttChromePref(this);
  document.title = url;
  var splits = url.split(/:/g);
  var port = 23;
  if(splits.length == 1)
  {
  }
  else if(splits.length == 2)
  {
    url = splits[0];
    port = parseInt(splits[1]);
  }
  this.telnetCore.connect(url, port);
};

pttchrome.App.prototype.disconnect = function() {
  this.telnetCore.listener = null;
  this.telnetCore.disconnect();

  this.view.blinkTimeout.cancel();

  this.cancelMouseDownTimer();
  this.cancelMbTimer();
};

pttchrome.App.prototype.onConnect = function() {
  dumpLog(DUMP_TYPE_LOG, "pttchrome onConnect");
  this.connectState = 1;
  this.updateTabIcon('connect');
  this.idleTime = 0;
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
  this.idleTime = 0;

  this.updateTabIcon('disconnect');
  this.timerOnsec.cancel();
};

pttchrome.App.prototype.resetUnusedTime = function() {
  this.idleTime = 0;
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
  if (this.pref && this.pref.modalShown)
    return;
  this.pasting = true;
  this.setInputAreaFocus();
  document.execCommand("paste", false, null);
  this.pasting = false;
};

pttchrome.App.prototype.doSelectAll = function() {
  //var allspans = document.getElementById("main");
  window.getSelection().selectAllChildren(this.view.mainDisplay);
};

pttchrome.App.prototype.doPreferences = function() {
  $('#prefModal').modal('show');
};

pttchrome.App.prototype.switchMouseBrowsing = function() {
  if (this.CmdHandler.getAttribute('useMouseBrowsing')=='1') {
    this.CmdHandler.setAttribute('useMouseBrowsing', '0');
    this.buf.useMouseBrowsing=false;
  } else {
    this.CmdHandler.setAttribute('useMouseBrowsing', '1');
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
  if (this.antiIdleTime && this.idleTime > this.antiIdleTime) {
    if (this.antiIdleStr!='' && this.connectState==1)
      this.telnetCore.send(this.antiIdleStr);
  } else {
    if (this.connectState==1)
      this.idleTime+=1000;
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
    //dumpLog(DUMP_TYPE_LOG, "onPrefChange " + name + ":" + pref.get(name));
    switch (name) {
    case 'useMouseBrowsing':
      var useMouseBrowsing = pref.get(name);
      this.CmdHandler.setAttribute('useMouseBrowsing', useMouseBrowsing?'1':'0');
      this.buf.useMouseBrowsing = useMouseBrowsing;

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
    case 'mouseBrowsingHighlight':
      this.buf.highlightCursor = pref.get(name);
      this.view.redraw(true);
      this.view.updateCursorPos();
      break;
    case 'closeQuery':
      if (pref.get(name))
        this.regExitAlert();
      else
        this.unregExitAlert();
      break;
    case 'antiIdleTime':
      this.antiIdleTime = pref.get(name) * 1000;
      break;
    case 'dbcsDetect':
      this.view.dbcsDetect = pref.get(name);
      break;
    case 'fontFace':
      var fontFace = pref.get(name);
      if (!fontFace) 
        fontFace='monospace';
      this.view.setFontFace(fontFace);
      break;
    default:
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
  if (this.pref && this.pref.modalShown)
    return;
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
  if (this.pref && this.pref.modalShown)
    return;
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
  } else if(e.button == 2) {
    this.mouseRightButtonDown = true;
    //create context menu
    this.resetMenuItems();
  }
};

pttchrome.App.prototype.mouse_up = function(e) {
  if (this.pref && this.pref.modalShown)
    return;
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
    if (this.pref && this.pref.modalShown)
      return;
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
  if (this.pref && this.pref.modalShown)
    return;
  if(window.getSelection().isCollapsed && !this.mouseLeftButtonDown)
    this.setInputAreaFocus();
};

pttchrome.App.prototype.key_press = function(e) {
  if (this.pref && this.pref.modalShown)
    return;
  if (this.cancelDownloadAndPaste()) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  if (window.getSelection().isCollapsed)
    this.setInputAreaFocus();
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
  var popup_pref = this.createMenu(msg("menu_toggleMouseBrowsing"), function() {
      pttchrome.app.switchMouseBrowsing();
  }, null, 'toggleMouseBrowsing');
  var popup_pref = this.createMenu(msg("menu_pref"), function() {
      pttchrome.app.doPreferences();
  }, null, 'pref');
};
